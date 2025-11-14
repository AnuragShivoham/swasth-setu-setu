import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  FileText,
  Plus,
  Calendar,
  User,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  createdAt: string;
  lastVisit?: string;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: "consultation" | "diagnosis" | "treatment" | "prescription" | "test" | "other";
  title: string;
  description: string;
  notes: string;
  doctor: string;
  createdAt: string;
}

interface MedicalHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onClose: () => void;
}

const MedicalHistory = ({ open, onOpenChange, patient, onClose }: MedicalHistoryProps) => {
  const { toast } = useToast();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "consultation" as MedicalRecord["type"],
    title: "",
    description: "",
    notes: "",
    doctor: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      loadMedicalRecords();
    }
  }, [patient]);

  const loadMedicalRecords = () => {
    if (!patient) return;
    const storedRecords = JSON.parse(localStorage.getItem(`medical_records_${patient.id}`) || "[]");
    setRecords(storedRecords);
  };

  const saveMedicalRecords = (updatedRecords: MedicalRecord[]) => {
    if (!patient) return;
    localStorage.setItem(`medical_records_${patient.id}`, JSON.stringify(updatedRecords));
    setRecords(updatedRecords);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.doctor.trim()) newErrors.doctor = "Doctor name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRecord = () => {
    if (!patient || !validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const newRecord: MedicalRecord = {
      id: Date.now().toString(),
      patientId: patient.id,
      date: formData.date,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      notes: formData.notes,
      doctor: formData.doctor,
      createdAt: new Date().toISOString(),
    };

    const updatedRecords = [...records, newRecord];
    saveMedicalRecords(updatedRecords);

    // Update patient's last visit
    const updatedPatient = { ...patient, lastVisit: formData.date };
    const patients = JSON.parse(localStorage.getItem("patients") || "[]");
    const updatedPatients = patients.map((p: Patient) =>
      p.id === patient.id ? updatedPatient : p
    );
    localStorage.setItem("patients", JSON.stringify(updatedPatients));

    toast({
      title: "Record added",
      description: "Medical record has been added successfully.",
    });

    resetForm();
    setShowAddRecord(false);
  };

  const handleEditRecord = () => {
    if (!editingRecord || !validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const updatedRecord: MedicalRecord = {
      ...editingRecord,
      date: formData.date,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      notes: formData.notes,
      doctor: formData.doctor,
    };

    const updatedRecords = records.map(r =>
      r.id === editingRecord.id ? updatedRecord : r
    );
    saveMedicalRecords(updatedRecords);

    toast({
      title: "Record updated",
      description: "Medical record has been updated successfully.",
    });

    resetForm();
    setEditingRecord(null);
    setShowAddRecord(false);
  };

  const handleDeleteRecord = (recordId: string) => {
    const updatedRecords = records.filter(r => r.id !== recordId);
    saveMedicalRecords(updatedRecords);

    toast({
      title: "Record deleted",
      description: "Medical record has been removed.",
    });
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: "consultation",
      title: "",
      description: "",
      notes: "",
      doctor: "",
    });
    setErrors({});
  };

  const startEdit = (record: MedicalRecord) => {
    setFormData({
      date: record.date,
      type: record.type,
      title: record.title,
      description: record.description,
      notes: record.notes,
      doctor: record.doctor,
    });
    setEditingRecord(record);
    setShowAddRecord(true);
  };

  const getTypeIcon = (type: MedicalRecord["type"]) => {
    switch (type) {
      case "consultation":
        return <User className="h-4 w-4" />;
      case "diagnosis":
        return <AlertCircle className="h-4 w-4" />;
      case "treatment":
        return <CheckCircle className="h-4 w-4" />;
      case "prescription":
        return <FileText className="h-4 w-4" />;
      case "test":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: MedicalRecord["type"]) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800";
      case "diagnosis":
        return "bg-red-100 text-red-800";
      case "treatment":
        return "bg-green-100 text-green-800";
      case "prescription":
        return "bg-purple-100 text-purple-800";
      case "test":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Medical History - {patient.name}
          </DialogTitle>
          <DialogDescription>
            View and manage medical records for {patient.name} (ID: {patient.patientId})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Age:</span>{" "}
                  {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
                </div>
                <div>
                  <span className="font-medium">Gender:</span>{" "}
                  <Badge variant="outline">{patient.gender}</Badge>
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {patient.phone}
                </div>
                <div>
                  <span className="font-medium">Last Visit:</span>{" "}
                  {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "Never"}
                </div>
              </div>

              {patient.medicalHistory.length > 0 && (
                <div>
                  <span className="font-medium">Medical History:</span>
                  <div className="mt-2 space-y-1">
                    {patient.medicalHistory.map((item, index) => (
                      <Badge key={index} variant="secondary" className="mr-2">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Record Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Medical Records ({records.length})</h3>
            <Button onClick={() => setShowAddRecord(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>

          {/* Records List */}
          <div className="space-y-4">
            {records.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No medical records yet</h4>
                  <p className="text-muted-foreground mb-4">
                    Start by adding the first medical record for this patient.
                  </p>
                  <Button onClick={() => setShowAddRecord(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Record
                  </Button>
                </CardContent>
              </Card>
            ) : (
              records
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className={getTypeColor(record.type)}>
                              {getTypeIcon(record.type)}
                              <span className="ml-1 capitalize">{record.type}</span>
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(record.date).toLocaleDateString()}
                            </div>
                          </div>

                          <h4 className="font-semibold mb-2">{record.title}</h4>
                          <p className="text-muted-foreground mb-3">{record.description}</p>

                          {record.notes && (
                            <div className="mb-3">
                              <span className="font-medium text-sm">Notes:</span>
                              <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                            </div>
                          )}

                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Doctor:</span> {record.doctor}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this record?")) {
                                handleDeleteRecord(record.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </div>

        {/* Add/Edit Record Form */}
        {showAddRecord && (
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">
              {editingRecord ? "Edit Medical Record" : "Add Medical Record"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="recordDate">Date *</Label>
                <Input
                  id="recordDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordType">Type *</Label>
                <select
                  id="recordType"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as MedicalRecord["type"] }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="consultation">Consultation</option>
                  <option value="diagnosis">Diagnosis</option>
                  <option value="treatment">Treatment</option>
                  <option value="prescription">Prescription</option>
                  <option value="test">Test/Lab Result</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recordTitle">Title *</Label>
                <Input
                  id="recordTitle"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief title for this record"
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.title}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordDescription">Description *</Label>
                <Textarea
                  id="recordDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the medical event"
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordNotes">Additional Notes</Label>
                <Textarea
                  id="recordNotes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes or observations"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordDoctor">Doctor *</Label>
                <Input
                  id="recordDoctor"
                  value={formData.doctor}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctor: e.target.value }))}
                  placeholder="Name of the treating doctor"
                  className={errors.doctor ? "border-destructive" : ""}
                />
                {errors.doctor && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.doctor}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setEditingRecord(null);
                  setShowAddRecord(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingRecord ? handleEditRecord : handleAddRecord}
                disabled={loading}
              >
                {loading ? "Saving..." : editingRecord ? "Update Record" : "Add Record"}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MedicalHistory;
