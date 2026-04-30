import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPrescriptionBody, savePrescriptionBody, clearPrescriptionMessage } from "../../Reducer/PrescriptionSlice";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Button, Card, Label } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import { Save, FileText } from "lucide-react";

const ManagePrescription = () => {
    const dispatch = useDispatch();
    const { prescriptionData, loading, message, error } = useSelector((state) => state?.prescription);
    const [footerDescription, setFooterDescription] = useState("");

    useEffect(() => {
        dispatch(getPrescriptionBody());
    }, [dispatch]);

    useEffect(() => {
        if (prescriptionData) {
            setFooterDescription(prescriptionData.footerDescription || "");
        }
    }, [prescriptionData]);

    useEffect(() => {
        if (message) {
            if (error) {
                toast.error(message);
            } else {
                toast.success(message);
            }
            dispatch(clearPrescriptionMessage());
        }
    }, [message, error, dispatch]);

    const handleSave = () => {
        dispatch(savePrescriptionBody({ footerDescription }));
    };

    return (
        <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white shadow-sm">
            <ToastContainer />
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Manage Prescription</h2>
                        <p className="text-gray-500 text-sm mt-1">Configure the footer description and other details for prescriptions</p>
                    </div>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="bg-[#52b69a] hover:bg-black text-white"
                >
                    <Save size={18} className="mr-2" /> {loading ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <Card className="border-gray-200">
                <div className="space-y-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="footer-desc" value="Prescription Footer Description" className="text-lg font-semibold" />
                            <p className="text-xs text-gray-400 mt-1">This text will appear at the bottom of all generated prescriptions.</p>
                        </div>
                        <div className="ck-editor-container min-h-[300px]">
                            <CKEditor
                                editor={ClassicEditor}
                                data={footerDescription}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    setFooterDescription(data);
                                }}
                                config={{
                                    placeholder: "Write your prescription footer description here...",
                                    toolbar: [
                                        'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'undo', 'redo'
                                    ]
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-start gap-3">
                    <div className="text-blue-500 mt-0.5">
                        <FileText size={18} />
                    </div>
                    <div>
                        <h4 className="text-blue-800 font-bold text-sm">Preview Hint</h4>
                        <p className="text-blue-700 text-xs mt-1">
                            The footer description is typically used for medical disclaimers, contact information, or hospital-specific instructions. 
                            Ensure the content is legally compliant and clearly legible.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagePrescription;
