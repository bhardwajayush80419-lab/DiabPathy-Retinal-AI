package com.diabprojectbackend.controller;

import com.diabprojectbackend.entity.OtpVerification;
import com.diabprojectbackend.entity.OtpRepository;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${twilio.account.sid}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    @PostConstruct
    public void initTwilio() {
        try {
            if (twilioAccountSid != null && !twilioAccountSid.isEmpty() &&
                    !twilioAccountSid.equals("AC_YOUR_SID_HERE")) {
                Twilio.init(twilioAccountSid, twilioAuthToken);
            }
        } catch (Exception e) {
            System.err.println("Twilio initialization warning: " + e.getMessage());
        }

    }

    // 1. Send / Generate OTP API (With Real Email & SMS Dispatch)
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        if (identifier == null || identifier.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Identifier (Email or Phone) is required"));
        }

        // Generate 4-digit OTP
        String otpCode = String.format("%04d", new Random().nextInt(10000));
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);

        // Check if identifier already exists, update or save new
        Optional<OtpVerification> existing = otpRepository.findByIdentifier(identifier);
        OtpVerification otpVerification;
        if (existing.isPresent()) {
            otpVerification = existing.get();
            otpVerification.setOtpCode(otpCode);
            otpVerification.setExpiryTime(expiryTime);
        } else {
            otpVerification = new OtpVerification(identifier, otpCode, expiryTime);
        }

        otpRepository.save(otpVerification);

        // Auto-detect and Dispatch via Email or SMS
        try {
            if (identifier.contains("@")) {
                // Send Real Email via Gmail SMTP
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(identifier);
                message.setSubject("DiabPathy Portal - Secure Login OTP");
                message.setText("Your secure verification OTP code for DiabPathy Portal is: " + otpCode + "\nValid for 5 minutes.");
                mailSender.send(message);
            } else {
                // Send Real SMS via Twilio (Automatically appends +91 for 10-digit numbers)
                String formattedPhone = identifier.trim();
                if (!formattedPhone.startsWith("+")) {
                    formattedPhone = "+91" + formattedPhone;
                }

                Message.creator(
                        new PhoneNumber(formattedPhone),
                        new PhoneNumber(twilioPhoneNumber),
                        "Your DiabPathy Secure Login OTP is: " + otpCode
                ).create();
            }
        } catch (Exception e) {
            System.err.println("Dispatch Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to dispatch OTP: " + e.getMessage()));
        }

        return ResponseEntity.ok(Map.of(
                "message", "OTP sent successfully"
        ));
    }

    // 2. Verify OTP API
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        String enteredOtp = request.get("otp");

        Optional<OtpVerification> recordOpt = otpRepository.findByIdentifier(identifier);
        if (recordOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "OTP not requested or expired"));
        }

        OtpVerification record = recordOpt.get();

        if (record.getExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "OTP has expired"));
        }

        if (!record.getOtpCode().equals(enteredOtp)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid OTP code"));
        }

        // OTP verified successfully, clean up record
        otpRepository.delete(record);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Authentication successful"
        ));
    }
}