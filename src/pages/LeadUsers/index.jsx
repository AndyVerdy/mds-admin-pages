import { useCallback, useEffect, useMemo, useState } from "react";
import { copyToClipboard } from "../../components/ui/copy-button";
import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import { TooltipProvider } from "../../components/ui/tooltip";
import DataTable from "../../components/dataTable/DataTable";
import { getColumns } from "./columns";
import { useGetCommunityMembersQuery, useLazyGetCommunityMembersQuery } from "../../services/communityMembers";

import { FilterBuilder, useFilterBuilder, applyFilters } from "../../components/filterBuilder";

// ── Filter field definitions for Lead Users table ────────────────────
const LEAD_FILTER_FIELDS = [
  {
    key: "fullName",
    label: "Name",
    type: "text",
    accessor: (row) => {
      const u = row?.user_id;
      return `${u?.first_name || ""} ${u?.last_name || ""}`.trim();
    },
  },
  {
    key: "displayName",
    label: "Display name",
    type: "text",
    accessor: (row) => row?.user_id?.display_name || "",
  },
  {
    key: "email",
    label: "User email",
    type: "text",
    accessor: (row) =>
      row?.user_id?.["Preferred Email"] || row?.user_id?.email || "",
  },
  {
    key: "membership",
    label: "Membership",
    type: "select",
    apiParam: "tier",
    accessor: (row) => row?.tier_id?.name || "",
    options: [
      { value: "free", label: "Free" },
      { value: "premium", label: "Premium" },
      { value: "enterprise", label: "Enterprise" },
    ],
  },
  {
    key: "joinDate",
    label: "Joined",
    type: "date",
    accessor: (row) => row?.groupos_join_date || "",
  },
  {
    key: "isOnline",
    label: "Online status",
    type: "boolean",
    accessor: (row) => row?.isOnline,
  },
];

export default function LeadUsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Filter builder
  const filterBuilder = useFilterBuilder(LEAD_FILTER_FIELDS);

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

  const [triggerFetchAll] = useLazyGetCommunityMembersQuery();

  const { data, isFetching, error } = useGetCommunityMembersQuery({
    page: paginationState.pageIndex + 1,
    limit: paginationState.pageSize,
    search: debouncedSearch,
    membership: "nonsubscribe",
    ...apiFilterParams,
  });

  const rawMembers = data?.data || [];
  const totalItems = data?.count || 0;
  const onlineCount = rawMembers.filter((m) => m.isOnline).length;
  const totalCount = totalItems;

  // Fetch ALL rows for export (all pages)
  const fetchAllRows = useCallback(async () => {
    const result = await triggerFetchAll({
      page: 1,
      limit: totalCount || 10000,
      search: debouncedSearch,
      membership: "nonsubscribe",
      ...apiFilterParams,
    }).unwrap();
    return result?.data || [];
  }, [triggerFetchAll, totalCount, debouncedSearch, apiFilterParams]);

  // Apply client-side advanced filters (for conditions the API can't handle)
  const members = useMemo(() => {
    if (!filterBuilder.hasConditions) return rawMembers;
    return applyFilters(rawMembers, filterBuilder.filterState, LEAD_FILTER_FIELDS);
  }, [rawMembers, filterBuilder.filterState, filterBuilder.hasConditions]);

  const pagination = useMemo(
    () => ({
      totalItems: filterBuilder.hasConditions ? members.length : totalItems,
      totalPages: Math.ceil(
        (filterBuilder.hasConditions ? members.length : totalItems) /
          paginationState.pageSize
      ),
      itemsPerPage: paginationState.pageSize,
    }),
    [totalItems, members.length, paginationState.pageSize, filterBuilder.hasConditions]
  );

  const handleCopyEmail = useCallback((email) => {
    copyToClipboard(email);
  }, []);

  const handleAction = useCallback((action, member) => {
    const userId = member?.user_id?._id;
    if (!userId) return;

    switch (action) {
      case "view":
        window.open(`/admin/commu-members/view/${userId}`, "_blank");
        break;
      case "edit":
        window.open(`/admin/commu-members/edit/${userId}`, "_blank");
        break;
      case "delete":
        if (
          window.confirm(
            `Delete lead "${member?.user_id?.display_name || "Unknown"}"?`
          )
        ) {
          console.log("Delete lead:", userId);
        }
        break;
      case "resetSocial":
        console.log("Reset social login:", userId);
        break;
      case "connect":
        console.log("Connect with member:", userId);
        break;
      default:
        break;
    }
  }, []);

  const columns = useMemo(
    () =>
      getColumns({
        onCopyEmail: handleCopyEmail,
        onAction: handleAction,
      }),
    [handleCopyEmail, handleAction]
  );

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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Lead Users</h1>
          <p className="text-sm text-muted-foreground">
            Total online user: {onlineCount}
          </p>
        </div>

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
            fields={LEAD_FILTER_FIELDS}
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
          data={members}
          pagination={pagination}
          loading={isFetching}
          error={error}
          sorting={sorting}
          setSorting={setSorting}
          paginationState={paginationState}
          setPaginationState={setPaginationState}
          onClearFilters={handleClearFilters}
          row="lead"
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
