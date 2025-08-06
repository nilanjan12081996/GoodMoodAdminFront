import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  getCateGory,
  getSingleCateGory,
  updateCateGory,
} from "../../Reducer/CategorySlice";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CategoryUpdateModal = ({
  openCategoryModal,
  setOpenCategoryModal,
  cateGoryId,
}) => {
  const dispatch = useDispatch();
  const { singleCate } = useSelector((state) => state?.cate);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  useState(() => {
    dispatch(getSingleCateGory({ category_id: cateGoryId }));
  }, [cateGoryId]);

  useEffect(() => {
    setValue("category_name", singleCate?.result?.[0]?.category);
  }, [singleCate, setValue]);
  const onSubmit = (data) => {
    dispatch(updateCateGory({ ...data, category_id: cateGoryId })).then(
      (res) => {
        console.log("res", res);

        if (res?.payload?.status_code === 200) {
          setOpenCategoryModal(false);
          dispatch(getCateGory());
        }
      }
    );
  };
  return (
    <>
      <Modal
        show={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
      >
        <Modal.Header>Update Category</Modal.Header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="Category Name" />
                </div>
                <TextInput
                  id="name"
                  type="text"
                  placeholder="Enter Category name"
                  {...register("category_name")}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="cnl_btn"
              onClick={() => setOpenCategoryModal(false)}
            >
              Cancel
            </Button>
            <Button color="success" type="submit">
              Update Category
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};
export default CategoryUpdateModal;
