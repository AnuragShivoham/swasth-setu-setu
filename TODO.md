# TODO: Fix Navigation and Add History Sections

## Navigation Fixes
- [x] Fix "Start Vet Consultation" button in Pet.tsx to navigate to '/home?tab=chatbot&context=pet'
- [x] Fix "Quick Vet Chat" button in Pet.tsx to navigate to '/home?tab=chatbot&context=pet'
- [x] Fix other navigation buttons in Pet.tsx (emergency and specialists) to '/home?tab=chatbot&context=pet'
- [x] Fix navigation buttons in Human.tsx to '/home?tab=chatbot&context=human'

## History Sections
- [x] Add "History" tab to Home.tsx for patients to view consultations and appointments
- [x] Add history section to DoctorManagement.tsx for doctors to view patient requests and communications
- [x] Ensure history data is retrieved from localStorage (communication_requests, patient_requests, appointments)

## Testing
- [x] Test navigation from Pet and Human pages to Home chatbot tab
- [x] Verify history sections display data correctly
- [x] Fix video consultation buttons to open video call dialog instead of navigating to chat

## Branding Updates
- [x] Change app name from "SwasthSetu" to "PAWMANITY" with gradient fonts
- [x] Update all references in pages, components, and documentation
