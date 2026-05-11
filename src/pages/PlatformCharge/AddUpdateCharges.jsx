import { Button, Label, Modal, TextInput } from "flowbite-react"
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { createUpdatePlatformCharges } from "../../Reducer/PlatformSlice";
import { toast } from "react-toastify";

const AddUpdateCharges=({
    openAddModal,
    setOpenAddModal,
    isEdit,
    categoryId
})=>{
    const{charges}=useSelector((state)=>state?.platform)
    const dispatch = useDispatch();
  const {
    register,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();
  useEffect(()=>{
    if(isEdit){
        setValue("charge",charges?.data?.charge)
    }
    else{
        reset();
    }
  },[charges,isEdit])

  const onSubmit=(data)=>{
    dispatch(createUpdatePlatformCharges({...data,support_category:categoryId})).then((res)=>{
        if(res?.payload?.statusCode===200){
            setOpenAddModal(false)
            toast.success(res?.payload?.message)
        }
    })
  }
    return(
        <>
          <Modal show={openAddModal} onClose={() => setOpenAddModal(false)}>
                <Modal.Header>{isEdit?"Edit Charge":"Add Support"}</Modal.Header>
                <form 
                onSubmit={handleSubmit(onSubmit)}
                >
                  <Modal.Body>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 block">
                          <Label htmlFor="name" value="Charge Percentage" />
                        </div>
                        <TextInput
                          id="name"
                          type="text"
                          placeholder="Enter Charge Percentage"
                          {...register("charge",{required:true})}
                        />
                        {
                          errors.charge&&(
                            <span className="text-red-500">Charge is Required</span>
                          )
                        }
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button className="cnl_btn" onClick={() => setOpenAddModal(false)}>
                      Cancel
                    </Button>
                    <Button color="success" type="submit">
                     Add
                    </Button>
                  </Modal.Footer>
                </form>
              </Modal>
        </>
    )
}
export default AddUpdateCharges