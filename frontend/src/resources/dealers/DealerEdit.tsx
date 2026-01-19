import { useState } from 'react';
import {
  Edit,
  SimpleForm,
  ArrayInput,
  SimpleFormIterator,
  NumberInput,
  DateInput,
  BooleanInput,
  ReferenceInput,
  SelectInput,
  TextInput,
  Toolbar,
  SaveButton,
  useRedirect,
  useSimpleFormIterator,
  useRecordContext,
  useGetList,
  useDelete,
  useNotify,
  useRefresh,
  required,
  email,
} from 'react-admin';
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { DeleteUserDialog } from '../../components/DeleteUserDialog';

import {
  FormContainer,
  FormCard,
  FormHeader,
  Section,
  Field,
  TextInputField,
  SelectInputField,
  PhoneInputField,
  inputStyles,
  formToolbarStyles,
  cancelButtonStyles,
  saveButtonStyles,
} from '../../components/FormFields';
import { requiredValidator, emailValidator } from '../../utils/validation';

// Email Ekle Butonu
const AddEmailButton = () => {
  const { add } = useSimpleFormIterator();
  return (
    <Button
      size="small"
      onClick={() => add()}
      startIcon={<AddIcon sx={{ fontSize: 16 }} />}
      sx={{
        color: '#6b7280',
        textTransform: 'none',
        fontSize: 13,
        mt: 1,
        '&:hover': { bgcolor: '#f3f4f6' },
      }}
    >
      E-posta Ekle
    </Button>
  );
};

// Bütçe Planı Ekle Butonu
const AddBudgetPlanButton = () => {
  const { add } = useSimpleFormIterator();
  return (
    <Button
      size="small"
      onClick={() => add({ is_active: true })}
      startIcon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
      sx={{
        color: '#1a1a2e',
        textTransform: 'none',
        fontSize: 13,
        mt: 2,
        border: '1px dashed #d1d5db',
        borderRadius: '8px',
        px: 2,
        py: 1,
        '&:hover': { bgcolor: '#f9fafb', borderColor: '#9ca3af' },
      }}
    >
      Yeni Tarih Aralığı Ekle
    </Button>
  );
};

// Custom Toolbar
const DealerFormToolbar = ({ onCancel }: { onCancel: () => void }) => (
  <Toolbar sx={formToolbarStyles}>
    <Button onClick={onCancel} sx={cancelButtonStyles}>
      Vazgeç
    </Button>
    <SaveButton label="Güncelle" sx={saveButtonStyles} />
  </Toolbar>
);

export const DealerEdit = () => {
  const redirect = useRedirect();
  const notify = useNotify();

  const backUrl = '/backoffice/dealers';

  const onSuccess = () => {
    notify('Bayi güncellendi', { type: 'success' });
    redirect(backUrl);
  };

  const onError = (error: any) => {
    const msg = error?.body
      ? Object.values(error.body).flat().join(' ')
      : 'Hata oluştu';
    notify(msg, { type: 'error' });
  };

  const handleBack = () => redirect(backUrl);

  return (
    <Edit
      mutationMode="pessimistic"
      mutationOptions={{ onSuccess, onError }}
      actions={false}
      sx={{ '& .RaEdit-main': { mt: 0 } }}
    >
      <FormContainer maxWidth={700}>
        <FormHeader
          title="Bayi Düzenle"
          subtitle="Bayi bilgilerini güncelleyin"
          onBack={handleBack}
        />

        <FormCard>
          <SimpleForm toolbar={<DealerFormToolbar onCancel={handleBack} />} sx={{ p: 0 }}>
            {/* Temel Bilgiler */}
            <Section title="Temel Bilgiler" first />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <TextInputField
                source="dealer_code"
                label="Bayi Kodu"
                hint="Bayi kodu sonradan güncellenebilir"
              />
              <SelectInputField
                source="status"
                label="Durum"
                required
                choices={[
                  { id: 'aktif', name: 'Aktif' },
                  { id: 'pasif', name: 'Pasif' },
                  { id: 'askida', name: 'Askıda' },
                ]}
                validate={[requiredValidator()]}
              />
            </Box>

            <TextInputField
              source="dealer_name"
              label="Bayi Ünvanı"
              required
              validate={[requiredValidator()]}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <SelectInputField
                source="dealer_type"
                label="Bayi Tipi"
                required
                choices={[
                  { id: 'yetkili', name: 'Yetkili Bayi' },
                  { id: 'anlasmali', name: 'Anlaşmalı Bayi' },
                  { id: 'satis', name: 'Satış Bayisi' },
                ]}
                validate={[requiredValidator()]}
              />
              <Field label="Marka" hint="Opsiyonel">
                <ReferenceInput source="brand" reference="brands">
                  <SelectInput optionText="name" fullWidth sx={inputStyles} />
                </ReferenceInput>
              </Field>
            </Box>

            <TextInputField
              source="tax_number"
              label="Vergi Numarası"
              hint="Opsiyonel"
            />

            {/* Adres */}
            <Section title="Adres" />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <TextInputField
                source="city"
                label="İl"
                required
                validate={[requiredValidator()]}
              />
              <TextInputField
                source="district"
                label="İlçe"
                required
                validate={[requiredValidator()]}
              />
            </Box>

            <Box sx={{ gridColumn: 'span 2' }}>
              <TextInputField
                source="address"
                label="Adres"
                required
                validate={[requiredValidator()]}
                multiline
                rows={3}
              />
            </Box>

            <TextInputField
              source="region"
              label="Bölge"
              hint="Opsiyonel"
            />

            {/* İletişim */}
            <Section title="İletişim" />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <TextInputField
                source="email"
                label="E-posta"
                type="email"
                required
                validate={[requiredValidator(), emailValidator()]}
              />
              <PhoneInputField
                source="phone"
                label="Telefon"
                required
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
              <TextInputField
                source="contact_first_name"
                label="Sorumlu Adı"
                required
                validate={[requiredValidator()]}
              />
              <TextInputField
                source="contact_last_name"
                label="Sorumlu Soyadı"
                required
                validate={[requiredValidator()]}
              />
              <TextInputField
                source="regional_manager"
                label="Bölge Müdürü"
                required
                validate={[requiredValidator()]}
              />
            </Box>

            {/* Ek E-postalar */}
            <Field label="Ek E-postalar" hint="Opsiyonel">
              <ArrayInput source="additional_emails" label="">
                <SimpleFormIterator
                  inline
                  disableReordering
                  addButton={<AddEmailButton />}
                  sx={{
                    '& .RaSimpleFormIterator-line': {
                      borderBottom: 'none',
                      pb: 0,
                      mb: 1,
                    },
                    '& .RaSimpleFormIterator-action': {
                      visibility: 'visible',
                    },
                  }}
                >
                  <TextInput
                    source=""
                    label="E-posta"
                    validate={email()}
                    fullWidth
                    sx={inputStyles}
                  />
                </SimpleFormIterator>
              </ArrayInput>
            </Field>

            {/* Bütçe Planlaması */}
            <Section title="Bütçe Planlaması" />

            <Box
              sx={{
                bgcolor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                p: 2.5,
              }}
            >
              <ArrayInput source="budget_plans" label="">
                <SimpleFormIterator
                  disableReordering
                  addButton={<AddBudgetPlanButton />}
                  sx={{
                    '& .RaSimpleFormIterator-line': {
                      bgcolor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      p: 2,
                      mb: 2,
                    },
                    '& .RaSimpleFormIterator-action': {
                      visibility: 'visible',
                    },
                  }}
                >
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, width: '100%' }}>
                    <DateInput
                      source="start_date"
                      label="Başlangıç"
                      validate={required()}
                      fullWidth
                      sx={inputStyles}
                    />
                    <DateInput
                      source="end_date"
                      label="Bitiş"
                      validate={required()}
                      fullWidth
                      sx={inputStyles}
                    />
                    <NumberInput
                      source="budget_amount"
                      label="Bütçe (₺)"
                      validate={required()}
                      fullWidth
                      min={0}
                      sx={inputStyles}
                    />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, mt: 1.5, width: '100%', alignItems: 'center' }}>
                    <TextInput
                      source="description"
                      label="Açıklama"
                      fullWidth
                      sx={inputStyles}
                    />
                    <BooleanInput source="is_active" label="Aktif" defaultValue={true} />
                  </Box>
                </SimpleFormIterator>
              </ArrayInput>
            </Box>
          </SimpleForm>
        </FormCard>

        {/* Bağlı Kullanıcılar */}
        <DealerUsersSection />
      </FormContainer>
    </Edit>
  );
};

// Bağlı Kullanıcılar Bölümü
const DealerUsersSection = () => {
  const record = useRecordContext();
  const redirect = useRedirect();
  const notify = useNotify();
  const refresh = useRefresh();
  const [deleteOne] = useDelete();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const { data: users, isLoading } = useGetList(
    'users',
    {
      filter: { dealer: record?.id },
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'date_joined', order: 'DESC' },
    },
    { enabled: !!record?.id }
  );

  const handleAddUser = () => {
    redirect(`/backoffice/users/create?dealer=${record?.id}`);
  };

  const handleEditUser = (userId: number) => {
    redirect(`/backoffice/users/${userId}?redirect=/backoffice/dealers/${record?.id}`);
  };

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (userToDelete) {
      try {
        await deleteOne('users', { id: userToDelete.id, meta: { reason } });
        notify('Kullanıcı silindi', { type: 'success' });
        refresh();
      } catch (error) {
        notify('Silme işlemi başarısız', { type: 'error' });
      }
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  if (!record?.id) return null;

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        p: 4,
        mt: 3,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
          Bağlı Kullanıcılar ({users?.length || 0})
        </Typography>
        <Button
          size="small"
          onClick={handleAddUser}
          startIcon={<PersonAddIcon sx={{ fontSize: 16 }} />}
          sx={{
            color: '#1a1a2e',
            textTransform: 'none',
            fontSize: 13,
            fontWeight: 500,
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            px: 2,
            '&:hover': { bgcolor: '#f9fafb', borderColor: '#9ca3af' },
          }}
        >
          Kullanıcı Ekle
        </Button>
      </Box>

      {isLoading ? (
        <Typography sx={{ color: '#6b7280', py: 2 }}>Yükleniyor...</Typography>
      ) : !users || users.length === 0 ? (
        <Typography sx={{ color: '#6b7280', py: 2 }}>
          Bu bayiye bağlı kullanıcı bulunmuyor.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: 12, py: 1 }}>
                Ad Soyad
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: 12, py: 1 }}>
                E-posta
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: 12, py: 1 }}>
                Telefon
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: 12, py: 1, width: 60 }}>
                Durum
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: 12, py: 1, width: 70 }} align="right">
                İşlem
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                <TableCell sx={{ color: '#111827', borderBottom: '1px solid #f3f4f6', fontSize: 13, py: 1 }}>
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell sx={{ color: '#6b7280', borderBottom: '1px solid #f3f4f6', fontSize: 13, py: 1 }}>
                  {user.email}
                </TableCell>
                <TableCell sx={{ color: '#6b7280', borderBottom: '1px solid #f3f4f6', fontSize: 13, py: 1 }}>
                  {user.phone || '-'}
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1 }}>
                  <Chip
                    label={user.is_active ? 'Aktif' : 'Pasif'}
                    size="small"
                    sx={{
                      bgcolor: user.is_active ? '#dcfce7' : '#fee2e2',
                      color: user.is_active ? '#166534' : '#991b1b',
                      fontWeight: 500,
                      fontSize: 11,
                      height: 22,
                    }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #f3f4f6', py: 1, whiteSpace: 'nowrap' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditUser(user.id)}
                    sx={{ color: '#6b7280', p: 0.5, '&:hover': { color: '#374151', bgcolor: '#f3f4f6' } }}
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(user)}
                    sx={{ color: '#ef4444', p: 0.5, ml: 0.5, '&:hover': { color: '#dc2626', bgcolor: '#fee2e2' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        user={userToDelete}
      />
    </Box>
  );
};
