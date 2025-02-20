import { useEffect, useState } from 'react';
import { DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { Button, Menu, MenuButton, MenuItem, MenuList, Text, useDisclosure } from '@chakra-ui/react';
import { CiMenuKebab } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchMeetingData } from '../../../redux/slices/meetingSlice';
import { deleteManyApi } from 'services/api';
import CommonCheckTable from '../../../components/reactTable/checktable';
import MeetingAdvanceSearch from './components/MeetingAdvanceSearch';
import AddMeeting from './components/Addmeeting';
import CommonDeleteModel from 'components/commonDeleteModel';
import { HasAccess } from '../../../redux/accessUtils';

const Index = () => {
    const title = "Meetings";
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [action, setAction] = useState(false);
    const [selectedValues, setSelectedValues] = useState([]);
    const [advanceSearch, setAdvanceSearch] = useState(false);
    const [searchboxOutside, setSearchboxOutside] = useState('');
    const [deleteMany, setDeleteMany] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [displaySearchData, setDisplaySearchData] = useState(false);
    const [searchedData, setSearchedData] = useState([]);
    const [permission] = HasAccess(['Meetings']);

    useEffect(() => {
        fetchData();
    }, [action]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const result = await dispatch(fetchMeetingData());
            if (result.payload.status === 200) {
                setData(result.payload.data);
            } else {
                toast.error("Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching meetings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMeeting = async (ids) => {
        setIsLoading(true);
        try {
            let response = await deleteManyApi('api/meeting/deleteMany', ids);
            if (response.status === 200) {
                setSelectedValues([]);
                setDeleteMany(false);
                setAction(prev => !prev);
            }
        } catch (error) {
            console.error("Error deleting meetings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const actionHeader = {
        Header: "Action",
        isSortable: false,
        center: true,
        cell: ({ row }) => (
            <Text fontSize="md" fontWeight="900" textAlign="center">
                <Menu isLazy>
                    <MenuButton><CiMenuKebab /></MenuButton>
                    <MenuList minW="fit-content">
                        {permission?.view && (
                            <MenuItem
                                py={2.5}
                                color={'green'}
                                onClick={() => navigate(`/meeting/${row.values._id}`)}
                                icon={<ViewIcon fontSize={15} />}
                            >
                                View
                            </MenuItem>
                        )}
                        {permission?.delete && (
                            <MenuItem
                                py={2.5}
                                color={'red'}
                                onClick={() => {
                                    setDeleteMany(true);
                                    setSelectedValues([row.values._id]);
                                }}
                                icon={<DeleteIcon fontSize={15} />}
                            >
                                Delete
                            </MenuItem>
                        )}
                    </MenuList>
                </Menu>
            </Text>
        )
    };

    const tableColumns = [
        { Header: "#", accessor: "_id", isSortable: false, width: 10 },
        {
            Header: 'Agenda',
            accessor: 'agenda',
            cell: ({ row }) => (
                <Text
                    as="a"
                    href={`/meeting/${row.values._id}`}
                    color='brand.600'
                    fontSize="sm"
                    fontWeight="700"
                    sx={{ '&:hover': { color: 'blue.500', textDecoration: 'underline' } }}
                >
                    {row.values.agenda || ' - '}
                </Text>
            )
        },
        { Header: "Date & Time", accessor: "dateTime" },
        { Header: "Timestamp", accessor: "timestamp" },
        {
            Header: "Created By",
            accessor: "createBy",
            cell: ({ row }) => {
                const createdBy = row.values.createBy;
                return (
                    <Text fontSize="sm" fontWeight="700">
                        {createdBy?.firstName || 'N/A'} {createdBy?.lastName || ''}
                    </Text>
                );
            }
        },
        ...(permission?.update || permission?.view || permission?.delete ? [actionHeader] : [])
    ];

    return (
        <div>
            <CommonCheckTable
                title={title}
                isLoding={isLoading}
                columnData={tableColumns}
                allData={data}
                tableData={data}
                searchDisplay={displaySearchData}
                setSearchDisplay={setDisplaySearchData}
                searchedDataOut={searchedData}
                setSearchedDataOut={setSearchedData}
                tableCustomFields={[]}
                access={permission}
                onOpen={onOpen}
                selectedValues={selectedValues}
                setSelectedValues={setSelectedValues}
                setDelete={setDeleteMany}
                AdvanceSearch={
                    <Button
                        variant="outline"
                        colorScheme='brand'
                        size="sm"
                        onClick={() => setAdvanceSearch(true)}
                    >
                        Advanced Search
                    </Button>
                }
                searchboxOutside={searchboxOutside}
                setSearchboxOutside={setSearchboxOutside}
                handleSearchType="MeetingSearch"
            />

            <MeetingAdvanceSearch
                advanceSearch={advanceSearch}
                setAdvanceSearch={setAdvanceSearch}
                setSearchedData={setSearchedData}
                setDisplaySearchData={setDisplaySearchData}
                allData={data}
                setAction={setAction}
                setSearchbox={setSearchboxOutside}
            />
            <AddMeeting setAction={setAction} isOpen={isOpen} onClose={onClose} />

            <CommonDeleteModel
                isOpen={deleteMany}
                onClose={() => setDeleteMany(false)}
                type='Meetings'
                handleDeleteData={handleDeleteMeeting}
                ids={selectedValues}
            />
        </div>
    );
};

export default Index;