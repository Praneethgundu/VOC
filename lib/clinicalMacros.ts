export const DOT_PHRASES: Record<string, string> = {
  ".normalneck": "Neck is supple. Full range of motion. No cervical lymphadenopathy. No tenderness on palpation of cervical spine.",
  ".normalback": "Spine appears straight. No step-off or deformity. Full range of motion. Negative straight leg raise test bilaterally.",
  ".normalshoulder": "No visible deformity, swelling, or redness. Full active and passive range of motion. Rotator cuff strength 5/5 bilaterally.",
  ".normalneuro": "Cranial nerves II-XII intact. Sensation intact to light touch and pinprick. Deep tendon reflexes 2+ and symmetric. Normal gait.",
  ".counsel": "Patient counseled extensively regarding diagnosis, treatment options, expected course, and potential complications. All questions answered to patient's satisfaction.",
};

export const SMART_CHIPS: Record<string, { exam: string[], diagnosis: string[] }> = {
  "Neck Pain": {
    exam: ["Tenderness on palpation", "Restricted ROM", "Muscle Spasm", "Positive Spurling's test"],
    diagnosis: ["Cervical Spondylosis", "Muscle Strain", "Cervical Radiculopathy", "Whiplash Injury"]
  },
  "Lower Backache (LBA)": {
    exam: ["Paraspinal tenderness", "Restricted flexion", "Positive SLR", "Neurological deficit"],
    diagnosis: ["Lumbar Spondylosis", "Herniated Disc", "Muscle Spasm", "Sciatica"]
  },
  "Shoulder Pain": {
    exam: ["Painful arc", "Restricted overhead abduction", "Tenderness over bicipital groove", "Positive impingement sign"],
    diagnosis: ["Adhesive Capsulitis", "Rotator Cuff Tendinitis", "Biceps Tendinitis", "Impingement Syndrome"]
  },
  "Knee Pain": {
    exam: ["Crepitus present", "Mild effusion", "Joint line tenderness", "Positive McMurray's test"],
    diagnosis: ["Osteoarthritis", "Meniscal Tear", "Patellofemoral Pain Syndrome", "Ligament Sprain"]
  }
};
