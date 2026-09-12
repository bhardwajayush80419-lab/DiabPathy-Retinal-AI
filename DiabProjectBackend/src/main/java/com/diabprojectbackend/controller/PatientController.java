package com.diabprojectbackend.controller;

import com.diabprojectbackend.entity.Patient;
import com.diabprojectbackend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "*"})
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPatientData(
            @RequestParam("name") String name,
            @RequestParam("age") Integer age,
            @RequestParam("hasHistoryOfDiabetes") Boolean hasHistoryOfDiabetes,
            @RequestParam("image") MultipartFile file) {

        try {
            // 1. Save Image Locally
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            Files.write(filePath, file.getBytes());

            // 2. Create Database Entity
            Patient patient = new Patient();
            patient.setName(name);
            patient.setAge(age);
            patient.setHasHistoryOfDiabetes(hasHistoryOfDiabetes);
            patient.setFundusImagePath("uploads/" + filename);

            // 3. Forward Image to Python AI Service
            // 3. Forward Image to Python AI Service
            try {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

                // Safe way to send MultipartFile via RestTemplate
                org.springframework.core.io.ByteArrayResource fileAsResource = new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
                    @Override
                    public String getFilename() {
                        return file.getOriginalFilename();
                    }
                };
                body.add("file", fileAsResource);

                HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

                // Hit Python FastAPI on port 8000
                ResponseEntity<Map> response = restTemplate.postForEntity(
                        "http://127.0.0.1:8000/predict",
                        requestEntity,
                        Map.class
                );

                // Extract AI response and add to DB Entity
                if (response.getBody() != null) {
                    Integer severity = (Integer) response.getBody().get("drSeverityLevel");

                    // Heatmap currently not returned by Python, using a safe check
                    String heatmap = null;
                    if(response.getBody().containsKey("aiHeatmapPath")) {
                        heatmap = (String) response.getBody().get("aiHeatmapPath");
                    }

                    patient.setDrSeverityLevel(severity);
                    patient.setAiHeatmapPath(heatmap);
                }
            } catch (Exception e) {
                System.out.println("Python API Connection Error: " + e.getMessage());
            }


            // 4. Save Everything to Database
            Patient savedPatient = patientRepository.save(patient);
            return ResponseEntity.ok(savedPatient);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Image processing failed");
        }
    }

    // ================= MAIN NAYA CODE YAHAN ADD KIYA HAI =================

    // Fetch ALL Patients (Dashboard ke liye)
    @GetMapping("/all")
    public ResponseEntity<?> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }

    // Fetch Single Patient by ID (Detail page ke liye)
    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable Long id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}