import React from 'react';
import { useFormik } from "formik";
import * as yup from "yup";
import { 
    Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, 
    ModalOverlay, Grid, GridItem, Input, FormLabel, Text, Button 
} from '@chakra-ui/react';
import Spinner from 'components/spinner/Spinner';
import moment from 'moment';
import { getSearchData, setGetTagValues, setSearchValue } from '../../../../redux/slices/advanceSearchSlice';
import { useDispatch } from 'react-redux';

const MeetingAdvanceSearch = (props) => {
    const { allData, advanceSearch, setAdvanceSearch, isLoding, setSearchedData, setDisplaySearchData, setSearchbox } = props;

    const dispatch = useDispatch();

    const initialValues = {
        agenda: '',
        createBy: '',
        startDate: '',
        endDate: '',
        timeStartDate: '',
        timeEndDate: ''
    };

    const validationSchema = yup.object({
        agenda: yup.string().trim(),
        createBy: yup.string().email('Invalid email format'),
        startDate: yup.date().nullable(),
        endDate: yup.date()
            .nullable()
            .min(yup.ref('startDate'), "End Date must be after Start Date"),
        timeStartDate: yup.date().nullable(),
        timeEndDate: yup.date()
            .nullable()
            .min(yup.ref('timeStartDate'), "Time End Date must be after Time Start Date"),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            dispatch(setSearchValue(values));
            dispatch(getSearchData({ values, allData, type: 'Meeting' }));

            // Generate filter values for selected search criteria
            const getValue = [
                { name: ["agenda"], value: values.agenda },
                { name: ["createBy"], value: values.createBy },
                { 
                    name: ["startDate", "endDate"], 
                    value: values.startDate || values.endDate 
                        ? `From: ${values.startDate || 'Any'} To: ${values.endDate || 'Any'}` 
                        : '' 
                },
                { 
                    name: ["timeStartDate", "timeEndDate"], 
                    value: values.timeStartDate || values.timeEndDate 
                        ? `From: ${values.timeStartDate || 'Any'} To: ${values.timeEndDate || 'Any'}` 
                        : '' 
                }
            ];

            dispatch(setGetTagValues(getValue.filter(item => item.value)));

            setDisplaySearchData(true);
            setAdvanceSearch(false);
            resetForm();
            setSearchbox('');
        }
    });

    const { errors, touched, values, handleBlur, handleChange, handleSubmit, resetForm, dirty } = formik;

    return (
        <Modal onClose={() => { setAdvanceSearch(false); resetForm() }} isOpen={advanceSearch} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Advanced Search</ModalHeader>
                <ModalCloseButton onClick={() => { setAdvanceSearch(false); resetForm() }} />
                <ModalBody>
                    <Grid templateColumns="repeat(12, 1fr)" gap={2}>
                        {/* Agenda Field */}
                        <GridItem colSpan={{ base: 12, md: 6 }}>
                            <FormLabel fontSize='sm' fontWeight='600' color="#000" mt={2}>
                                Agenda
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                value={values.agenda}
                                name="agenda"
                                placeholder='Enter Agenda'
                                fontWeight='500'
                            />
                            {errors.agenda && touched.agenda && <Text color='red'>{errors.agenda}</Text>}
                        </GridItem>

                        {/* Created By Field */}
                        <GridItem colSpan={{ base: 12, md: 6 }}>
                            <FormLabel fontSize='sm' fontWeight='600' color="#000" mt={2}>
                                Created By (Email)
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                value={values.createBy}
                                name="createBy"
                                placeholder='Enter Email'
                                fontWeight='500'
                            />
                            {errors.createBy && touched.createBy && <Text color='red'>{errors.createBy}</Text>}
                        </GridItem>

                        {/* Date Filters */}
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel fontSize='sm' fontWeight='600' color="#000" mt={2}>
                                Date & Time
                            </FormLabel>
                        </GridItem>

                        <GridItem colSpan={{ base: 12, md: 6 }}>
                            <FormLabel fontSize='sm' fontWeight='600' color="#000" mt={2}>
                                From
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                type="date"
                                name='startDate'
                                value={values.startDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                fontWeight='500'
                            />
                        </GridItem>

                        <GridItem colSpan={{ base: 12, md: 6 }}>
                            <FormLabel fontSize='sm' fontWeight='600' color="#000" mt={2}>
                                To
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                type="date"
                                name='endDate'
                                value={values.endDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                min={values.startDate}
                                fontWeight='500'
                            />
                            {errors.endDate && touched.endDate && <Text color='red'>{errors.endDate}</Text>}
                        </GridItem>

                        {/* Time Filters */}
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel fontSize='sm' fontWeight='600' color="#000" mt={2}>
                                Time Stamp
                            </FormLabel>
                        </GridItem>

                        <GridItem colSpan={{ base: 12, md: 6 }}>
                            <FormLabel fontSize='sm' fontWeight='600' color="#000" mt={2}>
                                From
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                type="date"
                                name='timeStartDate'
                                value={values.timeStartDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                fontWeight='500'
                            />
                        </GridItem>

                        <GridItem colSpan={{ base: 12, md: 6 }}>
                            <FormLabel fontSize='sm' fontWeight='600' color="#000" mt={2}>
                                To
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                type="date"
                                name='timeEndDate'
                                value={values.timeEndDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                min={values.timeStartDate}
                                fontWeight='500'
                            />
                            {errors.timeEndDate && touched.timeEndDate && <Text color='red'>{errors.timeEndDate}</Text>}
                        </GridItem>
                    </Grid>
                </ModalBody>

                <ModalFooter>
                    <Button 
                        size="sm" 
                        variant="brand" 
                        mr={2} 
                        onClick={handleSubmit} 
                        disabled={isLoding || !dirty}
                    >
                        {isLoding ? <Spinner /> : 'Search'}
                    </Button>
                    <Button size="sm" variant="outline" colorScheme="red" onClick={resetForm}>
                        Clear
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default MeetingAdvanceSearch;
