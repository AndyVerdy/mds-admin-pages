import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import { TooltipProvider } from "../../components/ui/tooltip";
import DataTable from "../../components/dataTable/DataTable";
import { getColumns } from "./columns";
import {
  useGetVideosQuery,
  useLazyGetVideosQuery,
  useGetCategoriesQuery,
  useGetTagsQuery,
} from "../../services/videos";
import { FilterBuilder, useFilterBuilder, applyFilters } from "../../components/filterBuilder";

export default function ContentLibraryPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Fetch filter options
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: tagsData } = useGetTagsQuery();

  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];

  // Build filter fields dynamically (categories & tags come from API)
  const filterFields = useMemo(
    () => [
      {
        key: "title",
        label: "Video title",
        type: "text",
        accessor: (row) => row?.title || "",
      },
      {
        key: "views",
        label: "Views",
        type: "number",
        accessor: (row) => {
          const views = row?.views;
          return (
            (row?.starting_view_cnt || 0) +
            (Array.isArray(views) ? views.length : 0)
          );
        },
      },
      {
        key: "comments",
        label: "Comments",
        type: "number",
        accessor: (row) =>
          Array.isArray(row?.comments) ? row.comments.length : 0,
      },
      {
        key: "access",
        label: "Access",
        type: "select",
        accessor: (row) =>
          (row?.restrictionAccess || "public").toLowerCase(),
        options: [
          { value: "public", label: "Public" },
          { value: "restricted", label: "Restricted" },
        ],
      },
      {
        key: "createdAt",
        label: "Uploaded",
        type: "date",
        accessor: (row) => row?.createdAt || "",
      },
      {
        key: "updatedAt",
        label: "Last update",
        type: "date",
        accessor: (row) => row?.updatedAt || "",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        apiParam: "status",
        accessor: (row) => (row?.uploadstatus || "").toLowerCase(),
        options: [
          { value: "published", label: "Published" },
          { value: "completed", label: "Completed" },
          { value: "paused", label: "Paused" },
          { value: "draft", label: "Draft" },
          { value: "pending", label: "Pending" },
        ],
      },
      {
        key: "category",
        label: "Category",
        type: "select",
        apiParam: "category",
        accessor: (row) => row?.category?._id || row?.category || "",
        options: categories.map((cat) => ({
          value: cat._id || cat.id || cat.name,
          label: cat.name || cat.title,
        })),
      },
      {
        key: "tag",
        label: "Tag",
        type: "select",
        apiParam: "tag",
        accessor: (row) => {
          const t = row?.tags;
          if (Array.isArray(t)) return t.map((x) => x?._id || x).join(",");
          return t || "";
        },
        options: tags.map((tag) => ({
          value: tag._id || tag.id || tag.name,
          label: tag.name || tag.title,
        })),
      },
    ],
    [categories, tags]
  );

  // Filter builder
  const filterBuilder = useFilterBuilder(filterFields);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Build API params from filter state
  const apiFilterParams = filterBuilder.apiParams;

  // Fetch videos
  const {
    data: videosData,
    isFetching,
    error,
  } = useGetVideosQuery({
    page: paginationState.pageIndex + 1,
    limit: paginationState.pageSize,
    search: debouncedSearch,
    ...apiFilterParams,
  });

  const [triggerFetchAll] = useLazyGetVideosQuery();

  // Extract data
  const rawVideos =
    videosData?.data?.[0]?.videos || videosData?.data || [];
  const totalItems =
    videosData?.data?.[0]?.totalVideos || videosData?.count || 0;

  // Fetch ALL rows for export (all pages)
  const fetchAllRows = useCallback(async () => {
    const result = await triggerFetchAll({
      page: 1,
      limit: totalItems || 10000,
      search: debouncedSearch,
      ...apiFilterParams,
    }).unwrap();
    const allVideos = result?.data?.[0]?.videos || result?.data || [];
    return allVideos;
  }, [triggerFetchAll, totalItems, debouncedSearch, apiFilterParams]);

  // Apply client-side advanced filters
  const videos = useMemo(() => {
    if (!filterBuilder.hasConditions) return rawVideos;
    return applyFilters(rawVideos, filterBuilder.filterState, filterFields);
  }, [rawVideos, filterBuilder.filterState, filterBuilder.hasConditions, filterFields]);

  const pagination = useMemo(
    () => ({
      totalItems: filterBuilder.hasConditions ? videos.length : totalItems,
      totalPages: Math.ceil(
        (filterBuilder.hasConditions ? videos.length : totalItems) /
          paginationState.pageSize
      ),
      itemsPerPage: paginationState.pageSize,
    }),
    [totalItems, videos.length, paginationState.pageSize, filterBuilder.hasConditions]
  );

  const handleAction = useCallback((action, video) => {
    const videoId = video?._id;
    if (!videoId) return;

    switch (action) {
      case "edit":
        window.open(`/admin/contentlibrary/edit/${videoId}`, "_blank");
        break;
      case "duplicate":
        console.log("Duplicate video:", videoId);
        break;
      case "delete":
        if (
          window.confirm(`Delete video "${video?.title || "Untitled"}"?`)
        ) {
          console.log("Delete video:", videoId);
        }
        break;
      default:
        break;
    }
  }, []);

  const columns = useMemo(
    () => getColumns({ onAction: handleAction }),
    [handleAction]
  );

  const handleRowClick = useCallback((row, e) => {
    const videoId = row.original?._id;
    if (!videoId) return;
    window.open(`/admin/contentlibrary/edit/${videoId}`, "_blank");
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    filterBuilder.clearAll();
    setSorting([]);
    setPaginationState({ pageIndex: 0, pageSize: 20 });
  }, [filterBuilder]);

  return (
    <TooltipProvider>
      <div className="!pb-8">
        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 pb-6">
          {/* Search */}
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search...."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Advanced filter builder */}
          <FilterBuilder
            fields={filterFields}
            filterState={filterBuilder.filterState}
            addCondition={filterBuilder.addCondition}
            addGroup={filterBuilder.addGroup}
            removeCondition={filterBuilder.removeCondition}
            updateCondition={filterBuilder.updateCondition}
            setGroupLogic={filterBuilder.setGroupLogic}
            setRootLogic={filterBuilder.setRootLogic}
            clearAll={filterBuilder.clearAll}
            activeCount={filterBuilder.activeCount}
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={videos}
          pagination={pagination}
          loading={isFetching}
          error={error}
          sorting={sorting}
          setSorting={setSorting}
          paginationState={paginationState}
          setPaginationState={setPaginationState}
          onClearFilters={handleClearFilters}
          onRowClick={handleRowClick}
          row="video"
          bulkActions={true}
          showExport={true}
          fetchAllRows={fetchAllRows}
          showColumnVisibility={true}
          showPagination={true}
        />
      </div>
    </TooltipProvider>
  );
}
