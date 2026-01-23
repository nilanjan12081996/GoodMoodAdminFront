import { Button, Modal } from "flowbite-react"
import { useDispatch } from "react-redux"
import { deleteOption, getQuestion } from "../../Reducer/QuestionSlice"


const DeleteConfirmationModal=({deleteConfirmModal,setDeleteConfirmationModal,optionid,setOpenMappingModal})=>{
    const dispatch=useDispatch()
    const handleYes=()=>{
        dispatch(deleteOption({
            id:optionid
        })).then((res)=>{
            if(res?.payload?.statusCode===200){
                setDeleteConfirmationModal(false)
                setOpenMappingModal(false)
                dispatch(getQuestion())
                
            }
        })
    }
    return(
        <>
        <Modal show={deleteConfirmModal} onClose={() => setDeleteConfirmationModal(false)} size="xl">
            <Modal.Header>Are want you delete this option?</Modal.Header>
            <Modal.Body>
                <div className="flex gap-3 justify-end">
                    <div>
                       <Button color="gray" onClick={() => setDeleteConfirmationModal(false)}>No</Button> 
                    </div>
                    <div>
                        <Button onClick={handleYes} className="cnl_btn">
              Yes
            </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        </>
    )
}
export default DeleteConfirmationModal