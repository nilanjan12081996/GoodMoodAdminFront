import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import { useForm } from "react-hook-form";
import { Button, Label, Modal, Textarea, TextInput } from "flowbite-react";
import { getSpecialization, updateSpecialization } from "../../../Reducer/SpecializationSlice";

const UpdateSpecialization=({ 
                             openUpdateModal,
                            setOpenUpdateModal,
                            splId
                        })=>{
    const{singleData}=useSelector((state)=>state?.special)
    const dispatch=useDispatch()
      const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
      } = useForm();
    useEffect(()=>{
        setValue("name",singleData?.data?.[0]?.name)
        setValue("des",singleData?.data?.[0]?.des)
    },[singleData])
    const onSubmit=(data)=>{
        dispatch(updateSpecialization({
            ...data,
            id:splId,
            status:singleData?.data?.[0]?.status
        })).then((res)=>{
            if(res?.payload?.statusCode===200||res?.payload?.statusCode===201){
                setOpenUpdateModal(false)
                 dispatch(getSpecialization())
            }
        })
    }
    return(
        <>
          <Modal show={openUpdateModal} onClose={() => setOpenUpdateModal(false)}>
                <Modal.Header>Update Specialization</Modal.Header>
                <form 
                onSubmit={handleSubmit(onSubmit)}
                >
                  <Modal.Body>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 block">
                          <Label htmlFor="name" value="Name" />
                        </div>
                        <TextInput
                          id="name"
                          type="text"
                          placeholder="Enter Name"
                          {...register("name",{required:true})}
                        />
                        {
                          errors.name&&(
                            <span className="text-red-500">Name is Required</span>
                          )
                        }
                      </div>
                        <div>
                        <div className="mb-2 block">
                          <Label htmlFor="name" value="Description" />
                        </div>
                        <Textarea
                          id="name"
                          type="text"
                          placeholder="Enter Description"
                          {...register("des",{required:true})}
                        />
                         {
                          errors.des&&(
                            <span className="text-red-500">Description is Required</span>
                          )
                        }
                      </div>
                      {/* {
                        (id?.id==3 || id?.id==1)&&(
                           <div>
                        <div className="mb-2 block">
                          <Label htmlFor="name" value="Color code" />
                        </div>
                        <TextInput
                          id="name"
                          type="text"
                          placeholder="Enter Color Code"
                          {...register("colorCode",{required:true})}
                        />
                         {
                          errors.colorCode&&(
                            <span className="text-red-500">Color Code is Required</span>
                          )
                        }
                      </div>
                        )
                      } */}
                        
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button className="cnl_btn" onClick={() => setOpenUpdateModal(false)}>
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
export default UpdateSpecialization;