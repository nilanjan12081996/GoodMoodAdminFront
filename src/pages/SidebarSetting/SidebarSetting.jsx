import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import MapperQuestion from "../MoodMeter/MapperQuestion";
import { AgGridReact } from "ag-grid-react";
import { useDispatch } from "react-redux";
import { getMainSidebar, getSubSidebar, updateMainSidebar, updateSubSidebar } from "../../Reducer/SidebarSettingSlice";
import { Button, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import { dynamicSidebar } from "../../Reducer/SidebarSlice";

const SidebarSetting = () => {
  const { mainSidebar, subSidebar } = useSelector((state) => state?.sidebarsetiings);
  const { allMoodMeter, singleAwarness } = useSelector((state) => state?.moodData);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMainSidebar());
    dispatch(getSubSidebar());
  }, []);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
      dispatch(dynamicSidebar());
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
      dispatch(dynamicSidebar());
    });
  };

  return (
    <>
      {/* Increased max-width and padding for a larger overall layout size */}
      <div className="wrapper_area my-0 mx-auto p-8 rounded-xl bg-white max-w-7xl shadow-md">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Sidebar Setting</h2>
          </div>
          <form>
            {/* Increased gap between columns from gap-8 to gap-16 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

              {/* Main Sidebar Column */}
              <div className="flex flex-col gap-4 overflow-y-auto pr-2" style={{ maxHeight: '75vh' }}>
                <h3 className="text-lg font-medium text-gray-700">Main Sidebars</h3>
                {mainSidebar?.data?.map((item, index) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <TextInput
                      {...register(`sidebars.${index}.sidebarName`, {
                        required: "Sidebar name is required",
                      })}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      className="bg-green-500 hover:bg-green-600 text-white"
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

              {/* Sub Sidebar Column */}
              <div className="flex flex-col gap-4 overflow-y-auto pr-2" style={{ maxHeight: '75vh' }}>
                <h3 className="text-lg font-medium text-gray-700">Sub Sidebars</h3>
                {subSidebar?.data?.map((item, index) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <TextInput
                      {...register(`subsidebars.${index}.subSidebarName`, {
                        required: "Sub Sidebars name is required",
                      })}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      className="bg-green-500 hover:bg-green-600 text-white"
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
  );
};

export default SidebarSetting;