## Feature: Doctor-Patient Management

- When a user selects a doctor and the doctor accepts the invitation after reviewing the patient's problem, the patient should be added to the doctor's "View My Patients" page.
- On the "View My Patients" page, the doctor should be able to edit, delete, and add patients.
- The patient-doctor association should be created upon acceptance of the call request (video/audio/text).
- The frontend should fetch and display real patient data for each doctor.

# TODO: Add Notification Feature to Human and Pet Healthcare Pages

## Tasks
- [x] Add NotificationBell component to Human.tsx header
- [x] Import and add NotificationBell component to Pet.tsx header

## Details
- NotificationBell component is already implemented and functional
- Human.tsx already imports NotificationBell but doesn't render it
- Pet.tsx needs to import NotificationBell
- Add the component to the header next to the title for both pages
