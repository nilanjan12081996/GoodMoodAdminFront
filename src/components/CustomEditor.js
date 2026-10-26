import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export const editorConfiguration = {
  toolbar: [
    'undo',
    'redo',
    '|',
    'heading',
    '|',
    'bold',
    'italic',
    '|',
    'link',
    'insertTable',
    '|',
    'bulletedList',
    'numberedList',
  ],
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
  },
};

ClassicEditor.defaultConfig = {
  ...ClassicEditor.defaultConfig,
  ...editorConfiguration,
};

export const CustomClassicEditor = ClassicEditor;
export default ClassicEditor;
