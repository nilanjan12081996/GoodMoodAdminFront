import { Button, Modal } from "flowbite-react"
import { useDispatch } from "react-redux"
import { deleteOption, getQuestion, getSingleQuestion } from "../../Reducer/QuestionSlice"


const DeleteConfirmationModal=({deleteConfirmModal,setDeleteConfirmationModal,optionid,setOpenMappingModal,id})=>{
    const dispatch=useDispatch()
    const handleYes=()=>{
        dispatch(deleteOption({
            id:optionid
        })).then((res)=>{
            if(res?.payload?.statusCode===200){
                setDeleteConfirmationModal(false)
                // setOpenMappingModal(false)
                dispatch(getSingleQuestion({id:id?.id||id}))
                
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