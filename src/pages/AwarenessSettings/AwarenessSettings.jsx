import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { useEffect, useMemo, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";

import {
  getAwarenessSubtopics,
  toggleAwarenessStatus,
} from "../../Reducer/AwarenessSettingsSlice";
import { dynamicSidebar } from "../../Reducer/SidebarSlice";


// ======================================================
// STATUS TOGGLE COMPONENT
// ======================================================

const StatusToggle = ({ id, checked, onToggle }) => {
  const handleChange = (e) => {
    e.stopPropagation();

    onToggle(id, !checked);
  };

  return (
    <label className="inline-flex items-center cursor-pointer relative">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={handleChange}
        className="sr-only peer"
      />

      <div
        className="
          relative
          w-11
          h-6
          bg-gray-300
          rounded-full
          transition-colors
          duration-200
          peer-checked:bg-green-500

          after:content-['']
          after:absolute
          after:top-[2px]
          after:left-[2px]

          after:bg-white
          after:border
          after:border-gray-300
          after:rounded-full

          after:h-5
          after:w-5

          after:transition-transform
          after:duration-200

          peer-checked:after:translate-x-full
        "
      />
    </label>
  );
};


// ======================================================
// MAIN COMPONENT
// ======================================================

const AwarenessSettings = () => {
  const dispatch = useDispatch();

  const { subtopicsList, loading } = useSelector(
    (state) => state?.awarenessSettings
  );

  // Local status state
  // Example:
  // {
  //   1: true,
  //   2: false,
  //   3: true
  // }
  const [localStatuses, setLocalStatuses] = useState({});


  // ======================================================
  // FETCH AWARENESS SUBTOPICS
  // ======================================================

  useEffect(() => {
    dispatch(getAwarenessSubtopics());
  }, [dispatch]);


  // ======================================================
  // SYNC REDUX DATA WITH LOCAL STATE
  // ======================================================

  useEffect(() => {
    if (!subtopicsList?.data) return;

    const statusMap = {};

    subtopicsList.data.forEach((topic) => {
      statusMap[topic.id] =
        topic?.status === 1 ||
        topic?.status === true ||
        topic?.status === "1";
    });

    setLocalStatuses(statusMap);
  }, [subtopicsList]);


  // ======================================================
  // HANDLE TOGGLE
  // ======================================================

  const handleToggle = useCallback(
    async (id, newStatus) => {
      // Store old status
      const oldStatus = localStatuses[id] ?? false;

      // ------------------------------------------
      // 1. Immediately update UI
      // ------------------------------------------

      setLocalStatuses((prev) => ({
        ...prev,
        [id]: newStatus,
      }));

      try {
        // ------------------------------------------
        // 2. Call backend
        // ------------------------------------------

        const result = await dispatch(
          toggleAwarenessStatus({ id })
        );

        // ------------------------------------------
        // 3. API SUCCESS — keep the optimistic update & refresh sidebar
        // ------------------------------------------

        if (toggleAwarenessStatus.fulfilled.match(result)) {
          // Re-fetch sidebar so inactive items disappear immediately
          dispatch(dynamicSidebar());
        }

        // ------------------------------------------
        // 4. API FAILED — revert optimistic update
        // ------------------------------------------

        else {
          setLocalStatuses((prev) => ({
            ...prev,
            [id]: oldStatus,
          }));
        }

      } catch (error) {
        console.error("Toggle error:", error);

        // Revert UI
        setLocalStatuses((prev) => ({
          ...prev,
          [id]: oldStatus,
        }));
      }
    },
    [dispatch, localStatuses]
  );


  // ======================================================
  // FORMAT ROW DATA
  // ======================================================

  const rowData = useMemo(() => {
    if (!subtopicsList?.data) {
      return [];
    }

    return subtopicsList.data.map((topic) => {
      const apiStatus =
        topic?.status === 1 ||
        topic?.status === true ||
        topic?.status === "1";

      return {
        id: topic?.id,

        name:
          topic?.subSidebarName ||
          topic?.sub_sidebar_name ||
          "Unknown Topic",

        status:
          localStatuses[topic?.id] !== undefined
            ? localStatuses[topic?.id]
            : apiStatus,
      };
    });
  }, [subtopicsList?.data, localStatuses]);


  // ======================================================
  // GET ROW ID
  // ======================================================

  const getRowId = useCallback((params) => {
    return String(params.data.id);
  }, []);


  // ======================================================
  // AG GRID COLUMNS
  // ======================================================

  const columnDefs = useMemo(
    () => [
      {
        field: "name",

        headerName: "Awareness Subtopics",

        sortable: true,

        filter: true,

        flex: 1,
      },

      {
        field: "status",

        headerName: "Status",

        width: 200,

        sortable: false,

        filter: false,

        cellRenderer: (params) => {
          const id = params.data.id;

          const checked =
            localStatuses[id] ??
            params.data.status ??
            false;

          return (
            <div className="flex items-center h-full">
              <StatusToggle
                id={id}
                checked={Boolean(checked)}
                onToggle={handleToggle}
              />
            </div>
          );
        },
      },
    ],
    [localStatuses, handleToggle]
  );


  // ======================================================
  // UI
  // ======================================================

  return (
    <>
      <ToastContainer />

      <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">

        <div className="h-full lg:h-screen">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">

            <h2 className="text-2xl font-semibold">
              Awareness Settings
            </h2>

          </div>


          {/* GRID */}
          <div
            className="ag-theme-alpine"
            style={{
              height: 600,
              width: "100%",
            }}
          >

            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}

              getRowId={getRowId}

              pagination={true}

              paginationPageSize={10}

              domLayout="autoHeight"

              getRowHeight={() => 50}

              suppressRowClickSelection={true}

              animateRows={true}
            />

          </div>

        </div>

      </div>
    </>
  );
};

export default AwarenessSettings;