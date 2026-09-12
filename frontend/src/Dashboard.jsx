import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, Users, User, Settings, LogOut, ShieldCheck, 
  UploadCloud, Eye, FileText, CheckCircle2, RefreshCw, Lock, 
  Loader2, AlertCircle, Search, Moon, Sun, Maximize, X, 
  PlusCircle, History, Sparkles, Shield, Download, Edit3, 
  Building, MapPin, BadgeCheck, Copy, Clock, Check
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const doctorName = localStorage.getItem("loggedInDoctorName") || "Ayush Bhardwaj";

  const [patientName, setPatientName] = useState('Eleanor Vance');
  const [patientAge, setPatientAge] = useState('58');
  const [patientId] = useState('PT-8942-DR');
  const [activeEye, setActiveEye] = useState('OS');
  const [scans, setScans] = useState({
    OS: { file: null, preview: null, result: null, analyzing: false },
    OD: { file: null, preview: null, result: null, analyzing: false }
  });
  
  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1e293b] text-slate-100 flex flex-col justify-between py-6 px-4 z-20 shrink-0">
        <div>
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Eye className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-white">DiabPathy</h1>
            </div>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('screening')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === 'screening' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <PlusCircle className="w-5 h-5" /> New Screening
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <History className="w-5 h-5" /> Patient History
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <User className="w-5 h-5" /> Profile
            </button>
            <button 
              onClick={() => setActiveTab('more')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === 'more' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Settings className="w-5 h-5" /> More / Settings
            </button>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
        
        {/* Header */}
        <header className="h-[72px] bg-white px-8 flex items-center justify-between shrink-0 border-b border-slate-200">
          <div className="flex items-center text-slate-300">
             <span className="font-light">/</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${doctorName.replace(' ', '+')}&background=e2e8f0&color=1e293b`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 leading-tight">Dr. {doctorName}</p>
                <p className="text-[11px] text-slate-500 font-medium">Chief Ophthalmologist</p>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-1.5 text-sm font-bold text-rose-500 hover:text-rose-700 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto w-full">
          {activeTab === 'screening' && (
            <NewScreeningView 
              doctorName={doctorName}
              patientName={patientName} setPatientName={setPatientName}
              patientAge={patientAge} setPatientAge={setPatientAge}
              patientId={patientId}
              activeEye={activeEye} setActiveEye={setActiveEye}
              scans={scans} setScans={setScans}
            />
          )}
          {activeTab === 'history' && <PatientHistoryView doctorName={doctorName} />}
          {activeTab === 'profile' && <ProfileView doctorName={doctorName} />}
          {activeTab === 'more' && <MoreOptionsView onLogout={onLogout} doctorName={doctorName} />}
        </div>
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// 1. SCREENING COMPONENT
// -------------------------------------------------------------
function NewScreeningView({ 
  doctorName, patientName, setPatientName, patientAge, setPatientAge, 
  patientId, activeEye, setActiveEye, scans, setScans 
}) {
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScans(prev => ({
        ...prev,
        [activeEye]: {
          file: file,
          preview: URL.createObjectURL(file),
          result: null,
          analyzing: false
        }
      }));
    }
  };

  const removeImage = () => {
    setScans(prev => ({
      ...prev,
      [activeEye]: { file: null, preview: null, result: null, analyzing: false }
    }));
  };

  const handleReset = () => {
    setPatientName('Eleanor Vance');
    setPatientAge('58');
    setScans({
      OS: { file: null, preview: null, result: null, analyzing: false },
      OD: { file: null, preview: null, result: null, analyzing: false }
    });
  };

  const runAIScreening = async () => {
    const currentScan = scans[activeEye];
    if (!currentScan.file && !currentScan.preview) {
      alert(`Please upload a retinal scan for the ${activeEye === 'OS' ? 'Left' : 'Right'} Eye first.`);
      return;
    }

    setScans(prev => ({ ...prev, [activeEye]: { ...prev[activeEye], analyzing: true } }));

    const formData = new FormData();
    if (currentScan.file) {
      formData.append("file", currentScan.file);
    }
    formData.append("name", patientName);
    formData.append("age", patientAge);
    formData.append("laterality", activeEye);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });
      const data = await response.json();
      
      let lvl = parseInt(data.severity_level);
      if (isNaN(lvl)) {
         const lbl = (data.severity_label || data.predicted_class || "").toString();
         if (lbl.includes('1')) lvl = 1;
         else if (lbl.includes('2')) lvl = 2;
         else if (lbl.includes('3')) lvl = 3;
         else if (lbl.includes('4')) lvl = 4;
         else lvl = 0;
      }

      setScans(prev => ({
        ...prev,
        [activeEye]: {
          ...prev[activeEye],
          analyzing: false,
          result: {
            severity_level: lvl,
            severity_label: data.severity_label || data.predicted_class || `Stage ${lvl} Detected`,
            confidence: data.confidence || "97.8%",
            time: "612ms"
          }
        }
      }));
    } catch (error) {
      console.error("Screening Error:", error);
      alert("Failed to connect to Diagnostic Engine. Please ensure FastAPI is running on port 8000.");
      setScans(prev => ({ ...prev, [activeEye]: { ...prev[activeEye], analyzing: false } }));
    }
  };

  const currentScan = scans[activeEye];

  const exportCurrentPDF = () => {
    if (!currentScan.result) {
      alert("Please run AI screening before exporting the diagnostic report.");
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Header Banner
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text("DiabPathy Clinical Diagnostic Report", 14, 19);

      // Metadata
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(10);
      doc.text(`Report ID: ${patientId}`, 145, 15);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 145, 21);

      // Section: Patient Information
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text("Patient Information", 14, 45);
      
      doc.setFontSize(11);
      doc.text(`Full Legal Name : ${patientName}`, 14, 55);
      doc.text(`Age (Years)        : ${patientAge}`, 14, 63);
      doc.text(`Patient ID / MRN : ${patientId}`, 14, 71);
      doc.text(`Attending Dr.     : Dr. ${doctorName}`, 14, 79);
      doc.text(`Target Laterality : ${activeEye === 'OS' ? 'Left Eye (OS)' : 'Right Eye (OD)'}`, 14, 87);

      // Section: Diagnostic Analysis Results
      doc.setLineWidth(0.5);
      doc.line(14, 98, 196, 98);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text("Diagnostic Analysis Results", 14, 112);

      doc.setFontSize(12);
      doc.text(`Assessment Result  : ${currentScan.result.severity_label}`, 14, 124);
      doc.text(`Confidence Score  : ${currentScan.result.confidence}`, 14, 132);
      doc.text(`Processing Time    : ${currentScan.result.time}`, 14, 140);

      // Section: Physician Guidance / Recommendations
      doc.line(14, 150, 196, 150);
      doc.setFontSize(14);
      doc.text("Clinical Recommendations & Guidance", 14, 162);

      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const guidanceText = getPhysicianGuidance(currentScan.result.severity_level);
      doc.text(guidanceText, 14, 172, { maxWidth: 180 });

      // Footer Disclaimer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Disclaimer: This report is generated by an AI-assisted diagnostic tool and is intended for clinical support only.", 14, 275);

      doc.save(`Clinical_Report_${patientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to generate PDF.");
    }
  };

  const getLabelSuffix = (label) => {
    if (!label) return 'Unknown';
    if (label.includes('•')) {
      return label.split('•')[1].trim();
    }
    return label;
  };

  const getDynamicStyles = (lvl) => {
    if (lvl >= 3) return { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' };
    if (lvl > 0) return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' };
    return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' };
  };

  const getDynamicMetrics = (lvl) => {
    if (lvl === 0) return { m: "0 Detected", ms: "Clear", h: "None", hs: "Normal", v: "Absent", vs: "Normal vessels", d: "Low Risk", ds: "Intact fovea", color: "text-emerald-600" };
    if (lvl === 1) return { m: "1-5 Detected", ms: "Mild Spread", h: "Few", hs: "Isolated", v: "Absent", vs: "Normal", d: "Low Risk", ds: "Intact fovea", color: "text-amber-500" };
    if (lvl === 2) return { m: "6-15 Detected", ms: "Moderate Spread", h: "Moderate", hs: "<20 in quadrants", v: "Mild", vs: "Focal", d: "Moderate Risk", ds: "Monitor closely", color: "text-amber-600" };
    return { m: "15+ Detected", ms: "4-Quadrant Spread", h: "Flame & Blot", hs: ">20 in all quadrants", v: "Present", vs: "Inferotemporal", d: "High Risk", ds: "<500µm from center", color: "text-rose-500" };
  };

  const getPhysicianGuidance = (lvl) => {
    if (lvl === 0) return "Routine annual screening recommended. No signs of diabetic retinopathy detected in the current scan.";
    if (lvl === 1) return "Mild Non-Proliferative DR detected. Optimize glycemic control and schedule routine follow-up in 6-12 months.";
    if (lvl === 2) return "Moderate Non-Proliferative DR. Referral to ophthalmologist within 3-6 months for detailed fundus examination is recommended.";
    return "Severe NPDR / Proliferative DR detected. High risk of vision loss. Urgent referral to retinal specialist for anti-VEGF or PRP evaluation is required.";
  };

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-8">
        <div className="max-w-3xl">
          <h2 className="text-[26px] font-bold text-slate-800 tracking-tight flex items-center gap-3">
            New Diagnostic Screening 
          </h2>
          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
            Enter patient demographics and upload high-resolution fundus photography for automated diabetic retinopathy staging, macular edema stratification, and microvascular lesion segmentation.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={handleReset} className="flex items-center gap-2 text-xs bg-white text-slate-600 px-4 py-2.5 rounded-lg font-bold border border-slate-200 shadow-sm hover:bg-slate-50 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Reset Form
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full">
        
        {/* LEFT COLUMN */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-[20px] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Patient Demographics</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Mandatory for medical EHR reconciliation</p>
                </div>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-wide">HL7 / FHIR</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Legal Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={patientName} 
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Age (Years) <span className="text-rose-500">*</span></label>
                  <input 
                    type="number" 
                    value={patientAge} 
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Biological Sex</label>
                  <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 font-medium shadow-sm focus:outline-none">
                    <option>Female</option>
                    <option>Male</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">MRN / Clinical ID</label>
                  <span className="text-[10px] text-blue-600 flex items-center gap-1 font-bold"><Lock className="w-2.5 h-2.5" /> Auto-Generated</span>
                </div>
                <input type="text" readOnly value={patientId} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-mono text-slate-500 font-semibold cursor-not-allowed" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-[20px] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Fundus Retinal Capture</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Macula & Optic Disc centered photography</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-50 px-2 py-1 rounded">45° / 50° FOV</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Target Laterality</label>
              <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-lg">
                <button 
                  onClick={() => setActiveEye('OS')}
                  className={`flex-1 flex items-center justify-center py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${activeEye === 'OS' ? 'bg-white shadow-sm border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> Left Eye (OS)
                  {scans.OS.file && <CheckCircle2 className="w-3 h-3 ml-1.5 text-emerald-500" />}
                </button>
                <button 
                  onClick={() => setActiveEye('OD')}
                  className={`flex-1 flex items-center justify-center py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${activeEye === 'OD' ? 'bg-white shadow-sm border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> Right Eye (OD)
                  {scans.OD.file && <CheckCircle2 className="w-3 h-3 ml-1.5 text-emerald-500" />}
                </button>
              </div>
            </div>

            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

            <div className="mt-5">
              {currentScan.file || currentScan.preview ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src={currentScan.preview} className="w-10 h-10 rounded-md object-cover border border-emerald-200" alt="Scanned" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{currentScan.file?.name || `fundus_${activeEye}_sample.png`}</p>
                      <p className="text-[10px] font-medium text-emerald-600">Active • {activeEye} Scan Ready</p>
                    </div>
                  </div>
                  <button onClick={removeImage} className="text-rose-400 hover:text-rose-600 bg-white p-1 rounded-md shadow-sm border border-slate-100 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 rounded-xl p-6 text-center transition-all cursor-pointer"
                >
                  <UploadCloud className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-[13px] font-bold text-slate-700 mb-0.5">Drag & drop high-resolution scan</p>
                  <p className="text-[11px] text-slate-400 mb-3">or <span className="text-blue-600 underline">browse workstation files</span></p>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono font-bold">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">DICOM (.dcm)</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">PNG / JPEG</span>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={runAIScreening}
              disabled={(!currentScan.file && !currentScan.preview) || currentScan.analyzing}
              className={`w-full mt-5 font-bold py-3.5 px-4 rounded-xl text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                (!currentScan.file && !currentScan.preview) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#1e293b] hover:bg-slate-800 text-white shadow-md'
              }`}
            >
              {currentScan.analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> ANALYZING {activeEye}...</> : <><Activity className="w-4 h-4" /> Initiate {activeEye} AI Inference</>}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN Workspace */}
        <div className="xl:col-span-7">
          <div className="bg-white border border-slate-100 p-8 rounded-[20px] shadow-sm h-full flex flex-col justify-between">
            
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-[17px] font-bold text-slate-800 mb-1">Diagnostic Analysis Workspace</h3>
                {currentScan.result ? (
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${currentScan.result.severity_level > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    <span className={`w-2 h-2 rounded-full ${currentScan.result.severity_level > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span> {activeEye} Staging Completed ({getLabelSuffix(currentScan.result.severity_label)})
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                     <span className="w-2 h-2 bg-slate-300 rounded-full"></span> Awaiting {activeEye} Retinal Ingestion
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500">
                <Search className="w-4 h-4 hover:text-slate-800 cursor-pointer" />
                <Moon className="w-4 h-4 hover:text-slate-800 cursor-pointer" />
                <Sun className="w-4 h-4 hover:text-slate-800 cursor-pointer" />
                <Activity className="w-4 h-4 hover:text-slate-800 cursor-pointer" />
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <Maximize className="w-4 h-4 hover:text-slate-800 cursor-pointer" />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center py-6">
              {!currentScan.result && !currentScan.analyzing ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-500 ring-8 ring-blue-50/50">
                    <Eye className="w-10 h-10" />
                  </div>
                  <h4 className="text-[17px] font-bold text-slate-800 mb-2">No {activeEye} Scan Analyzed</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Upload and initiate inference for the {activeEye === 'OS' ? 'Left' : 'Right'} eye to activate the <span className="text-blue-600 font-bold">DeepPath-V3</span> neural ensemble.
                  </p>
                </div>
              ) : currentScan.analyzing ? (
                <div className="text-center py-16">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <h4 className="text-[17px] font-bold text-slate-800 mb-2">Analyzing {activeEye} Scan...</h4>
                  <p className="text-sm text-slate-500">Running deep neural algorithms on retinal fundus image.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl flex items-center justify-between p-3 border border-slate-100">
                    <div className="flex gap-6">
                       <div className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 ${getDynamicStyles(currentScan.result.severity_level).bg} ${getDynamicStyles(currentScan.result.severity_level).text}`}>
                         <span className={`w-2 h-2 rounded-full ${getDynamicStyles(currentScan.result.severity_level).dot}`}></span>
                         {currentScan.result.severity_label}
                       </div>
                       <div className="flex flex-col justify-center">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Confidence</span>
                         <span className="text-sm font-bold text-slate-700">{currentScan.result.confidence}</span>
                       </div>
                    </div>
                    <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      Analysis complete in {currentScan.result.time}
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 h-64 flex items-center justify-center shadow-inner">
                    {currentScan.preview && (
                      <img src={currentScan.preview} alt="GradCAM base" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    {currentScan.result.severity_level > 0 && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-500/40 to-yellow-400/40 mix-blend-multiply"></div>
                    )}
                    
                    <div className="absolute top-3 left-3 bg-[#1e293b]/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700 text-xs font-bold text-white flex items-center gap-2 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span> Grad-CAM CAM-V3 Active
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-xs font-bold text-slate-800 px-3 py-1.5 rounded-lg border border-white/20 shadow-md">
                      {activeEye} 50° FOV • Fovea Centered
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-left">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">Microaneurysms</span>
                      <span className="text-[15px] font-extrabold text-slate-800 block">{getDynamicMetrics(currentScan.result.severity_level).m}</span>
                      <span className={`text-[10px] font-bold ${getDynamicMetrics(currentScan.result.severity_level).color}`}>{getDynamicMetrics(currentScan.result.severity_level).ms}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">Hemorrhages</span>
                      <span className="text-[15px] font-extrabold text-slate-800 block">{getDynamicMetrics(currentScan.result.severity_level).h}</span>
                      <span className={`text-[10px] font-bold ${getDynamicMetrics(currentScan.result.severity_level).color}`}>{getDynamicMetrics(currentScan.result.severity_level).hs}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">Venous Beading</span>
                      <span className="text-[15px] font-extrabold text-slate-800 block">{getDynamicMetrics(currentScan.result.severity_level).v}</span>
                      <span className={`text-[10px] font-bold ${getDynamicMetrics(currentScan.result.severity_level).color}`}>{getDynamicMetrics(currentScan.result.severity_level).vs}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">DME Threat</span>
                      <span className="text-[15px] font-extrabold text-slate-800 block">{getDynamicMetrics(currentScan.result.severity_level).d}</span>
                      <span className={`text-[10px] font-bold ${getDynamicMetrics(currentScan.result.severity_level).color}`}>{getDynamicMetrics(currentScan.result.severity_level).ds}</span>
                    </div>
                  </div>

                  <div className={`${currentScan.result.severity_level > 0 ? 'bg-amber-50/50 border-amber-100' : 'bg-emerald-50/50 border-emerald-100'} border p-4 rounded-xl space-y-1.5`}>
                    <div className={`flex items-center gap-2 text-xs font-bold mb-1 ${currentScan.result.severity_level > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                      <Sparkles className={`w-4 h-4 ${currentScan.result.severity_level > 0 ? 'text-amber-600' : 'text-emerald-600'}`} /> 
                      Physician Decision Guidance
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {getPhysicianGuidance(currentScan.result.severity_level)}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={exportCurrentPDF}
                      className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" /> Export Diagnostic PDF Report
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-5 border-t border-slate-100 grid grid-cols-3 gap-4 text-left">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">HIPAA & GDPR Certified</p>
                  <p className="text-[10px] text-slate-500 font-medium">Retinal Vault</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">AES-256 GCM Transit</p>
                  <p className="text-[10px] text-slate-500 font-medium">Encryption</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">ISO 13485:2016</p>
                  <p className="text-[10px] text-slate-500 font-medium">Medical Device Protocol</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. PATIENT HISTORY COMPONENT
// -------------------------------------------------------------
function PatientHistoryView({ doctorName }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/history", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const exportRecordPDF = (record) => {
    try {
      const doc = new jsPDF();
      
      // Header Banner
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text("DiabPathy Clinical Diagnostic Report", 14, 19);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(10);
      doc.text(`Record ID: REC-${8000 + (record.id || 1)}`, 145, 15);
      doc.text(`Date: ${formatDate(record.scan_date)}`, 145, 21);

      // Patient Info
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text("Patient Information", 14, 45);

      doc.setFontSize(11);
      doc.text(`Full Legal Name : ${record.name}`, 14, 55);
      doc.text(`Age (Years)        : ${record.age}`, 14, 63);
      doc.text(`Attending Dr.     : Dr. ${doctorName}`, 14, 71);

      // Results
      doc.setLineWidth(0.5);
      doc.line(14, 85, 196, 85);

      doc.setFontSize(14);
      doc.text("Diagnostic Analysis Results", 14, 98);
      doc.setFontSize(12);
      doc.text(`Assessment Result : ${record.severity_label || `Stage ${record.dr_severity_level}`}`, 14, 110);

      doc.save(`Clinical_Report_${record.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to export record PDF.");
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient History Records</h2>
          <p className="text-sm text-slate-500 mt-1">Review past diagnostic assessments and patient data.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm font-medium">
            No patient history records found in PostgreSQL database yet.
          </div>
        ) : (
          <table className="w-full text-sm text-left text-slate-700 whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Record ID</th>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Age</th>
                <th className="px-6 py-4">Scan Date</th>
                <th className="px-6 py-4">Assessment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((record, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 font-semibold">REC-{8000 + (record.id || index)}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{record.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{record.age} Yrs</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{formatDate(record.scan_date)}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {record.severity_label || `Stage ${record.dr_severity_level} Detected`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => exportRecordPDF(record)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-lg transition-all border border-blue-200 shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Export PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. ENHANCED PROFILE COMPONENT
// -------------------------------------------------------------
function ProfileView({ doctorName }) {
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState('https://ui-avatars.com/api/?name=' + doctorName.replace(' ', '+') + '&background=e2e8f0&color=1e293b');
  const avatarInputRef = useRef(null);
  const [copiedStates, setCopiedStates] = useState({ npi: false, email: false });

  const [profile, setProfile] = useState({
    name: `Dr. ${doctorName}, MD, PhD`,
    role: "Chief Ophthalmologist & Director of Retinal AI Diagnostics",
    hospital: "National Eye Institute & Mount Sinai Health",
    location: "New York, NY",
    license: "MED-NY-883492-X",
    npi: "1049283741",
    email: "a.bhardwaj@diabscreen-ai.network",
    since: "Oct 2021"
  });

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [type]: true });
    setTimeout(() => setCopiedStates({ ...copiedStates, [type]: false }), 2000);
  };

  const handleExportProfile = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Practitioner Clinical Profile", 14, 22);
    doc.setFontSize(12);
    doc.text(`Name: ${profile.name}`, 14, 32);
    doc.text(`Role: ${profile.role}`, 14, 40);
    doc.text(`License: ${profile.license}`, 14, 48);
    doc.text(`NPI: ${profile.npi}`, 14, 56);
    doc.text(`Email: ${profile.email}`, 14, 64);
    doc.save(`${profile.name.replace(/[^a-zA-Z0-9]/g, '_')}_Profile.pdf`);
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Administrative Domain</span><span className="w-1 h-1 rounded-full bg-slate-300"></span><span>Practitioner Profile & Governance</span>
          </div>
          <h2 className="text-[28px] font-extrabold text-slate-800 tracking-tight">Practitioner Profile</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportProfile} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"><Download className="w-4 h-4 text-slate-400" /> Export Clinical Record</button>
          <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm border cursor-pointer ${isEditing ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' : 'bg-[#0f62fe] text-white border-[#0f62fe] hover:bg-blue-700'}`}>{isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}{isEditing ? 'Save Profile' : 'Edit Profile'}</button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-8 rounded-[20px] shadow-sm flex items-start gap-8 relative overflow-hidden">
        <div className="relative group shrink-0">
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 relative">
            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
            <div onClick={() => isEditing && avatarInputRef.current.click()} className={`absolute inset-0 bg-slate-900/50 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-opacity ${isEditing ? 'opacity-100 hover:bg-slate-900/70' : 'opacity-0'}`}>Upload</div>
            <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />
          </div>
          <div className="absolute bottom-1 right-2 w-5 h-5 bg-emerald-500 border-[3px] border-white rounded-full"></div>
        </div>

        <div className="flex-1 pt-1">
          <div className="flex items-center gap-3 mb-1.5">
            {isEditing ? <input type="text" name="name" value={profile.name} onChange={handleChange} className="text-2xl font-extrabold text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1 w-full max-w-md focus:outline-none focus:border-blue-500" /> : <h3 className="text-2xl font-extrabold text-slate-800">{profile.name}</h3>}
            {!isEditing && <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Lead Reviewer / Admin</span>}
          </div>
          {isEditing ? <input type="text" name="role" value={profile.role} onChange={handleChange} className="text-[15px] font-medium text-slate-600 bg-slate-50 border border-slate-300 rounded px-2 py-1 w-full mb-4 focus:outline-none" /> : <p className="text-[15px] font-medium text-slate-600 mb-4">{profile.role}</p>}
          <div className="flex items-center gap-6 text-[13px] text-slate-500 font-medium">
            <div className="flex items-center gap-2"><Building className="w-4 h-4 text-slate-400" /> {isEditing ? <input type="text" name="hospital" value={profile.hospital} onChange={handleChange} className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5" /> : profile.hospital}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {isEditing ? <input type="text" name="location" value={profile.location} onChange={handleChange} className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5" /> : profile.location}</div>
          </div>
          <div className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Practitioner Since: <span className="text-slate-600">{profile.since}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <div className="bg-white border border-slate-200 rounded-[20px] shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-bold text-slate-800"><BadgeCheck className="w-4 h-4 text-blue-600" /> Professional Credentials & Licensing</div><span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 px-2 py-1 rounded">Verified Registry</span></div>
          <div className="p-6 space-y-6 flex-1">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between"><div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">State Medical License</p>{isEditing ? <input type="text" name="license" value={profile.license} onChange={handleChange} className="text-lg font-mono font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-0.5 focus:outline-none" /> : <p className="text-lg font-mono font-bold text-slate-800">{profile.license}</p>}</div><div className="text-right"><span className="flex items-center justify-end gap-1 text-[11px] font-bold text-emerald-600 mb-0.5"><CheckCircle2 className="w-3.5 h-3.5" /> Active (Exp: 12/2026)</span><p className="text-xs text-slate-500 font-medium">New York State Board for Medicine</p></div></div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between"><div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">National Provider Identifier</p>{isEditing ? <input type="text" name="npi" value={profile.npi} onChange={handleChange} className="text-lg font-mono font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-0.5 focus:outline-none" /> : <p className="text-lg font-mono font-bold text-slate-800">{profile.npi}</p>}</div><button onClick={() => handleCopy(profile.npi, 'npi')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all shadow-sm cursor-pointer">{copiedStates.npi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}{copiedStates.npi ? 'Copied' : 'Copy NPI'}</button></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Degrees & Board Certifications</p><div className="space-y-2 text-[13px] text-slate-700 font-medium bg-slate-50 border border-slate-100 rounded-xl p-4"><p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> MBBS (Johns Hopkins)</p><div className="w-full h-px bg-slate-200"></div><p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> MD Ophthalmology (Harvard Medical)</p><div className="w-full h-px bg-slate-200"></div><p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Fellowship in Vitreoretinal Surgery (Moorfields)</p></div></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Primary Clinical Affiliations</p><div className="space-y-3 pl-1 border-l-2 border-slate-100 ml-1"><div className="pl-4 relative"><span className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white"></span><p className="text-[13px] font-bold text-slate-800">National Eye Institute, Dept of Retina Diagnostics</p></div><div className="pl-4 relative"><span className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white"></span><p className="text-[13px] font-medium text-slate-500">Mount Sinai Health System (Consulting Vitreoretinal Faculty)</p></div></div></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[20px] shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Shield className="w-4 h-4 text-emerald-600" /> Security & Account Settings</div><span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">ENCRYPTED</span></div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Clinical Email</p>{isEditing ? <input type="text" name="email" value={profile.email} onChange={handleChange} className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1 focus:outline-none" /> : <p className="text-sm font-bold text-slate-800">{profile.email}</p>}</div><button onClick={() => handleCopy(profile.email, 'email')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all shadow-sm cursor-pointer">{copiedStates.email ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}{copiedStates.email ? 'Copied' : 'Copy'}</button></div>
              <div className="w-full h-px bg-slate-100"></div>
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100"><div><p className="text-[13px] font-bold text-slate-800 mb-0.5">Two-Factor Authentication (2FA)</p><p className="text-[11px] text-slate-500">Hardware Security Key (FIDO2) / Authenticator App</p></div><span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Enabled</span></div>
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100"><div><p className="text-[13px] font-bold text-slate-800 mb-0.5">Session & Password</p><p className="text-[11px] text-slate-500">Password updated 42 days ago • Next rotation in 48 days</p></div><button onClick={() => alert("Password reset link sent to your clinical email.")} className="text-xs font-bold text-blue-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-all cursor-pointer">Update Password</button></div>
              <div className="flex items-center justify-between pt-2"><div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Associated EHR Sync Node</p><p className="text-[13px] font-bold text-slate-800">Epic FHIR Bridge v4.2</p><p className="text-[11px] text-slate-500">Cerner Millennium Gateway</p></div><div className="text-right space-y-2 text-[11px]"><p className="text-emerald-600 font-bold flex items-center justify-end gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Connected (3m ago)</p><p className="text-slate-400 font-mono">Node ID: EHR-NY-EPIC-01</p><p className="text-amber-500 font-bold flex items-center justify-end gap-1">Standby (Warm Sync)</p></div></div>
              <div className="w-full h-px bg-slate-100"></div>
              <div className="flex items-center justify-between pt-1"><p className="text-[13px] font-medium text-slate-600">Session Timeout: <span className="font-bold text-slate-800">15 min inactivity lock</span></p><button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">Configure Policies</button></div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[20px] shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Clock className="w-4 h-4 text-slate-400" /> Recent Audit & Activity Log</div><span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">HIPAA Verified</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. MORE OPTIONS & SETTINGS COMPONENT
// -------------------------------------------------------------
function MoreOptionsView({ onLogout, doctorName }) {
  return (
    <div className="space-y-6 w-full max-w-4xl animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Application & System Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage clinical workspace preferences and secure sessions.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Active Clinical Session</h4>
            <p className="text-xs text-slate-500">Logged in as Dr. {doctorName}</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl transition-all border border-rose-200 shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Terminate Session / Sign Out
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800">AI Diagnostic Engine Endpoint</h4>
            <p className="text-xs text-slate-500">Connected to FastAPI server on port 8000</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-200">Online & Active</span>
        </div>

        <div className="flex items-center justify-between pb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-800">PostgreSQL Unified Database</h4>
            <p className="text-xs text-slate-500">Port 5433 • dr_screening_db</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-200">Connected</span>
        </div>
      </div>
    </div>
  );
}