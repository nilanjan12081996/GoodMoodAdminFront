import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getMainSidebar,
  getSubSidebar,
  updateMainSidebar,
  updateSubSidebar,
} from "../../Reducer/SidebarSettingSlice";
import { Button, TextInput, Spinner } from "flowbite-react";
import { useForm } from "react-hook-form";
import { dynamicSidebar } from "../../Reducer/SidebarSlice";
import { showToast } from "../../utils/Toaster";

const SidebarSetting = () => {
  const { mainSidebar, subSidebar, loading } = useSelector(
    (state) => state?.sidebarsetiings
  );
  const dispatch = useDispatch();
  const [updatingKey, setUpdatingKey] = useState(null);

  useEffect(() => {
    dispatch(getMainSidebar());
    dispatch(getSubSidebar());
  }, [dispatch]);

  const { register, setValue, getValues } = useForm();

  useEffect(() => {
    if (mainSidebar?.data?.length) {
      mainSidebar.data.forEach((item, index) => {
        setValue(`sidebars.${index}.sidebarName`, item.sidebarName || "");
        setValue(`sidebars.${index}.id`, item.id);
      });
    }
  }, [mainSidebar, setValue]);

  useEffect(() => {
    if (subSidebar?.data?.length) {
      subSidebar.data.forEach((item, index) => {
        setValue(`subsidebars.${index}.subSidebarName`, item.subSidebarName || "");
        setValue(`subsidebars.${index}.id`, item.id);
      });
    }
  }, [subSidebar, setValue]);

  const handleUpdateMainSidebar = (item, index) => {
    const currentName = getValues(`sidebars.${index}.sidebarName`);
    if (!currentName || !currentName.trim()) {
      showToast("Main sidebar name cannot be empty", "error");
      return;
    }

    const key = `main-${item.id}`;
    setUpdatingKey(key);

    dispatch(
      updateMainSidebar({
        id: item.id,
        name: currentName.trim(),
      })
    )
      .unwrap()
      .then((res) => {
        showToast(
          res?.message || "Main sidebar updated successfully",
          "success"
        );
        dispatch(getMainSidebar());
        dispatch(dynamicSidebar());
      })
      .catch((err) => {
        showToast(
          err?.message || err || "Failed to update main sidebar",
          "error"
        );
      })
      .finally(() => {
        setUpdatingKey(null);
      });
  };

  const handleUpdateSubSidebar = (item, index) => {
    const currentName = getValues(`subsidebars.${index}.subSidebarName`);
    if (!currentName || !currentName.trim()) {
      showToast("Sub sidebar name cannot be empty", "error");
      return;
    }

    const key = `sub-${item.id}`;
    setUpdatingKey(key);

    dispatch(
      updateSubSidebar({
        id: item.id,
        name: currentName.trim(),
      })
    )
      .unwrap()
      .then((res) => {
        showToast(
          res?.message || "Sub sidebar updated successfully",
          "success"
        );
        dispatch(getSubSidebar());
        dispatch(dynamicSidebar());
      })
      .catch((err) => {
        showToast(
          err?.message || err || "Failed to update sub sidebar",
          "error"
        );
      })
      .finally(() => {
        setUpdatingKey(null);
      });
  };

  return (
    <>
      <div className="wrapper_area my-0 mx-auto p-8 rounded-xl bg-white max-w-7xl shadow-md">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Sidebar Setting</h2>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Main Sidebar Column */}
              <div
                className="flex flex-col gap-4 overflow-y-auto pr-2"
                style={{ maxHeight: "75vh" }}
              >
                <h3 className="text-lg font-medium text-gray-700">
                  Main Sidebars
                </h3>
                {mainSidebar?.data?.map((item, index) => {
                  const isUpdating = updatingKey === `main-${item.id}`;
                  return (
                    <div key={item.id} className="flex gap-3 items-center">
                      <TextInput
                        {...register(`sidebars.${index}.sidebarName`)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleUpdateMainSidebar(item, index);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        disabled={isUpdating}
                        className="bg-green-500 hover:bg-green-600 text-white min-w-[90px]"
                        onClick={() => handleUpdateMainSidebar(item, index)}
                      >
                        {isUpdating ? (
                          <span className="flex items-center gap-1">
                            <Spinner size="xs" /> Updating
                          </span>
                        ) : (
                          "Update"
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Sub Sidebar Column */}
              <div
                className="flex flex-col gap-4 overflow-y-auto pr-2"
                style={{ maxHeight: "75vh" }}
              >
                <h3 className="text-lg font-medium text-gray-700">
                  Sub Sidebars
                </h3>
                {subSidebar?.data?.map((item, index) => {
                  const isUpdating = updatingKey === `sub-${item.id}`;
                  return (
                    <div key={item.id} className="flex gap-3 items-center">
                      <TextInput
                        {...register(`subsidebars.${index}.subSidebarName`)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleUpdateSubSidebar(item, index);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        disabled={isUpdating}
                        className="bg-green-500 hover:bg-green-600 text-white min-w-[90px]"
                        onClick={() => handleUpdateSubSidebar(item, index)}
                      >
                        {isUpdating ? (
                          <span className="flex items-center gap-1">
                            <Spinner size="xs" /> Updating
                          </span>
                        ) : (
                          "Update"
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SidebarSetting;