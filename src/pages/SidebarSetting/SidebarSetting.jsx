import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import MapperQuestion from "../MoodMeter/MapperQuestion";
import { AgGridReact } from "ag-grid-react";
import { useDispatch } from "react-redux";
import { getMainSidebar, getSubSidebar, updateMainSidebar, updateSubSidebar } from "../../Reducer/SidebarSettingSlice";
import { Button, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import { dynamicSidebar } from "../../Reducer/SidebarSlice";

const SidebarSetting=()=>{
 const{mainSidebar,subSidebar}=useSelector((state)=>state?.sidebarsetiings)
 const { allMoodMeter,singleAwarness } = useSelector((state) => state?.moodData);
 const dispatch=useDispatch()
 useEffect(()=>{
dispatch(getMainSidebar())
dispatch(getSubSidebar())
 },[])
   const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  console.log("mainSidebar",mainSidebar);
  console.log("subSidebar",subSidebar);
  
  
 useEffect(() => {
  if (mainSidebar?.data?.length) {
    mainSidebar.data.forEach((item, index) => {
      setValue(`sidebars.${index}.sidebarName`, item.sidebarName);
      setValue(`sidebars.${index}.id`, item.id);
    });
  }
}, [mainSidebar, setValue]);

 useEffect(() => {
  if (subSidebar?.data?.length) {
    subSidebar.data.forEach((item, index) => {
      setValue(`subsidebars.${index}.subSidebarName`, item.subSidebarName);
      setValue(`subsidebars.${index}.id`, item.id);
    });
  }
}, [subSidebar, setValue]);
const handleUpdateMainSidebar = (sidebar) => {
  dispatch(
    updateMainSidebar({
      id: sidebar.id,
      data: sidebar.sidebarName,
    })
  ).then(() => {
    dispatch(getMainSidebar());
     dispatch(dynamicSidebar())
  });
};

const handleUpdateSubSidebar = (subSidebar) => {
  dispatch(
    updateSubSidebar({
      id: subSidebar.id,
      data: subSidebar.subSidebarName,
    })
  ).then(() => {
    dispatch(getSubSidebar());
     dispatch(dynamicSidebar())
  });
};
    return(
        <>
          <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
        <div className="h-full lg:h-screen">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Sidebar Setting</h2>
      
          </div>
          <form>
            <div className="flex justify-between">

           
            <div>
            {mainSidebar?.data?.map((item, index) => (
                <div key={item.id} className="flex gap-2 mb-3 items-center">
                <TextInput
                    {...register(`sidebars.${index}.sidebarName`, {
                    required: "Sidebar name is required",
                    })}
                    className="w-80"
                />

                <Button
                    type="button"
                    className="bg-green-500"
                    onClick={() =>
                    handleSubmit((data) =>
                    handleUpdateMainSidebar(data.sidebars[index])
                    )()
  }
                >
                    Update
                </Button>
                </div>
            ))}
            </div>
            <div>
                 {subSidebar?.data?.map((item, index) => (
                <div key={item.id} className="flex gap-2 mb-3 items-center">
                <TextInput
                    {...register(`subsidebars.${index}.subSidebarName`, {
                    required: "Sub Sidebars name is required",
                    })}
                    className="w-80"
                />

                <Button
                    type="button"
                    className="bg-green-500"
                                onClick={() =>
                    handleSubmit((data) =>
                    handleUpdateSubSidebar(data.subsidebars[index])
                    )()
                }
                >
                    Update
                </Button>
                </div>
            ))}
            </div>
             </div>
            

        </form>
        </div>
     
      </div>
        </>
    )
}
export default SidebarSetting