import { Button, Label, Modal, Textarea, TextInput } from "flowbite-react"
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { cateGoryAddUpdate, getChildCategory } from "../../../Reducer/SupportSlice";
import { addSpecialization, getSpecialization } from "../../../Reducer/SpecializationSlice";

const AddSpecialization=({ openAddModal,setOpenAddModal,id})=>{

   const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit=(data)=>{
    dispatch(addSpecialization({...data,status:1})).then((res)=>{
      if(res?.payload?.statusCode===201||res?.payload?.statusCode===200)
      {
        setOpenAddModal(false)
         dispatch(getSpecialization())
      }
    })
  }
    return(
        <>
         <Modal show={openAddModal} onClose={() => setOpenAddModal(false)}>
        <Modal.Header>Add Specialization</Modal.Header>
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
            <Button className="cnl_btn" onClick={() => setOpenTagModal(false)}>
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
export default AddSpecialization