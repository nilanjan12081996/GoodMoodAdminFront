import { Button, Label, Modal, Textarea, TextInput } from "flowbite-react"
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getTimeSlot, updateTimeSlot } from "../../../Reducer/DoctorSlice";

const UpdateSlot=({
    openSlotModal,
    setOpenSlotModal,
    slotId
})=>{
     const {singleTimeSlot}=useSelector((state)=>state?.doctors)
      const dispatch=useDispatch()
      const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
      } = useForm();

      useEffect(()=>{
        setValue("slot_time",singleTimeSlot?.data?.slot_time)
      },[singleTimeSlot])
      const onSubmit=(data)=>{
        dispatch(updateTimeSlot({
            id:slotId,
            slot_time:data?.slot_time,
            status:singleTimeSlot?.data?.status

        })).then((res)=>{
            if((res?.payload?.statusCode===201||res?.payload?.statusCode===200)){
                setOpenSlotModal(false)
                dispatch(getTimeSlot())
            }
        })
      }
    return(
        <>
        <Modal show={openSlotModal} onClose={() => setOpenSlotModal(false)}>
                        <Modal.Header>Update Time Slot</Modal.Header>
                        <form 
                        onSubmit={handleSubmit(onSubmit)}
                        >
                          <Modal.Body>
                            <div className="space-y-4">
                              <div>
                                <div className="mb-2 block">
                                  <Label htmlFor="name" value="Slot Timing" />
                                </div>
                                <TextInput
                                  id="name"
                                  type="text"
                                  placeholder="Enter Slot Timing"
                                  {...register("slot_time",{required:true})}
                                />
                                {
                                  errors.slot_time&&(
                                    <span className="text-red-500">Slot Time is Required</span>
                                  )
                                }
                              </div>
                               
                         
                            </div>
                          </Modal.Body>
                          <Modal.Footer>
                            <Button className="cnl_btn" onClick={() => setOpenSlotModal(false)}>
                              Cancel
                            </Button>
                            <Button color="success" type="submit">
                             Update
                            </Button>
                          </Modal.Footer>
                        </form>
                      </Modal>
        </>
    )
}
export default UpdateSlot