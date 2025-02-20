import { Button, Flex, FormLabel, Grid, GridItem, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, Text, Textarea } from '@chakra-ui/react';
import { CUIAutoComplete } from 'chakra-ui-autocomplete';
import MultiContactModel from 'components/commonTableModel/MultiContactModel';
import MultiLeadModel from 'components/commonTableModel/MultiLeadModel';
import Spinner from 'components/spinner/Spinner';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { LiaMousePointerSolid } from 'react-icons/lia';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { MeetingSchema } from 'schema';
import { getApi, postApi } from 'services/api';

const AddMeeting = (props) => {
    const { onClose, isOpen, setAction, from, fetchData, view } = props;
    const [leaddata, setLeadData] = useState([]);
    const [contactdata, setContactData] = useState([]);
    const [isLoding, setIsLoding] = useState(false);
    const [contactModelOpen, setContactModel] = useState(false);
    const [leadModelOpen, setLeadModel] = useState(false);
    const todayTime = new Date().toISOString().split('.')[0];
    const leadData = useSelector((state) => state?.leadData?.data);
    const user = JSON.parse(localStorage.getItem('user'));
    const contactList = useSelector((state) => state?.contactData?.data);

    const initialValues = {
        agenda: '',
        attendes: [],
        attendesLead: [],
        location: '',
        related: 'None',
        dateTime: '',
        notes: '',
        createBy: user?._id,
    };

    const formik = useFormik({
        initialValues,
        validationSchema: MeetingSchema,
        onSubmit: async (values, { resetForm }) => {
            setIsLoding(true);
            try {
                await postApi('api/meeting/add', values);
                toast.success('Meeting added successfully');
                setAction(prev => !prev);
                onClose();
                resetForm();
            } catch (error) {
                toast.error('Failed to add meeting');
            } finally {
                setIsLoding(false);
            }
        },
    });
    
    const { errors, touched, values, handleBlur, handleChange, handleSubmit, setFieldValue } = formik;

    useEffect(() => {
        if (values.related === 'Contact') {
            setContactData(contactList);
        } else if (values.related === 'Lead') {
            setLeadData(leadData);
        }
    }, [values.related, contactList, leadData]);

    return (
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent height={'580px'}>
                <ModalHeader>Add Meeting</ModalHeader>
                <ModalCloseButton />
                <ModalBody overflowY={'auto'} height={'400px'}>
                    <MultiContactModel data={contactdata} isOpen={contactModelOpen} onClose={() => setContactModel(false)} fieldName='attendes' setFieldValue={setFieldValue} />
                    <MultiLeadModel data={leaddata} isOpen={leadModelOpen} onClose={() => setLeadModel(false)} fieldName='attendesLead' setFieldValue={setFieldValue} />

                    <Grid templateColumns='repeat(12, 1fr)' gap={3}>
                        <GridItem colSpan={12}>
                            <FormLabel>Agenda<Text color={'red'}>*</Text></FormLabel>
                            <Input name='agenda' value={values.agenda} onChange={handleChange} onBlur={handleBlur} placeholder='Agenda' borderColor={errors.agenda && touched.agenda ? 'red.300' : null} />
                            <Text color={'red'}>{errors.agenda && touched.agenda && errors.agenda}</Text>
                        </GridItem>
                        <GridItem colSpan={12}>
                            <FormLabel>Related To<Text color={'red'}>*</Text></FormLabel>
                            <RadioGroup onChange={(e) => setFieldValue('related', e)} value={values.related}>
                                <Stack direction='row'>
                                    <Radio value='Contact'>Contact</Radio>
                                    <Radio value='Lead'>Lead</Radio>
                                </Stack>
                            </RadioGroup>
                        </GridItem>
                        <GridItem colSpan={12}>
                            <FormLabel>Location</FormLabel>
                            <Input name='location' value={values.location} onChange={handleChange} onBlur={handleBlur} placeholder='Location' borderColor={errors.location && touched.location ? 'red.300' : null} />
                        </GridItem>
                        <GridItem colSpan={12}>
                            <FormLabel>Date & Time<Text color={'red'}>*</Text></FormLabel>
                            <Input type='datetime-local' name='dateTime' value={values.dateTime} onChange={handleChange} onBlur={handleBlur} min={dayjs(todayTime).format('YYYY-MM-DDTHH:mm')} borderColor={errors.dateTime && touched.dateTime ? 'red.300' : null} />
                        </GridItem>
                        <GridItem colSpan={12}>
                            <FormLabel>Notes</FormLabel>
                            <Textarea name='notes' value={values.notes} onChange={handleChange} onBlur={handleBlur} placeholder='Notes' borderColor={errors.notes && touched.notes ? 'red.300' : null} />
                        </GridItem>
                    </Grid>
                </ModalBody>
                <ModalFooter>
                    <Button size='sm' variant='brand' onClick={handleSubmit} disabled={isLoding}>{isLoding ? <Spinner /> : 'Save'}</Button>
                    <Button size='sm' variant='outline' colorScheme='red' onClick={() => {formik.resetForm(); onClose();}}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddMeeting;