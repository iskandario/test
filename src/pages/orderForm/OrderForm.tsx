import React from 'react';
import styled from 'styled-components';
import { Button } from '@mui/material';
import { useForm } from "react-hook-form";
import { useLocation } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { ProductType } from "../../store/useProducts";
import { theme } from "../../_globalStyles/theme";
import BackButton from "../../components/BackButton";


interface OrderFormProps { }

interface FormData {
    lastName: string;
    firstName: string;
    middleName?: string;
    city: string;
    address: string;
    phoneNumber: string;
    email: string;
    comment?: string;
}

const OrderForm: React.FC<OrderFormProps> = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const location = useLocation();
    const { products, total } = location.state as {
        products: (ProductType & { quantity: number })[];
        total: number;
    };

   const onSubmit = async (data: FormData) => {
  const orderData = {
    ...data,
    products,
    total,
  };

  console.log('Отправляемые данные заказа:', orderData);

  try {
    const response = await fetch('https://vyacheslavnabrand.ru/process_payment.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    console.log('PAYMENT RESPONSE:', result);

    if (!response.ok || result.status !== 'success' || !result.confirmation_url) {
      console.error('Ошибка создания платежа:', result);
      throw new Error('Ошибка создания платежа');
    }

    // ✅ ВАЖНОЕ МЕСТО — РЕДИРЕКТ
    window.location.href = result.confirmation_url;

  } catch (error) {
    console.error('Ошибка при отправке формы:', error);
    alert('Ошибка при создании платежа. Попробуйте ещё раз.');
  }
};


    return (
        <StyledForm onSubmit={handleSubmit(onSubmit)}>

            <Grid container alignItems="center" justifyContent="flex-start">
                <StyledBackButton>
                    <BackButton />
                </StyledBackButton>
            </Grid>

            <Grid container spacing={6}> {/* Увеличиваем расстояние между столбцами и строками */}
                <StyledFieldGrid item xl={4} md={4} xs={12}>
                    <input placeholder={'Фамилия'} {...register("lastName", { required: true })} />
                    {errors.lastName && <span>Это поле обязательно</span>}
                </StyledFieldGrid>
                <StyledFieldGrid item xl={4} md={4} xs={12}>
                    <input placeholder={'Имя'} {...register("firstName", { required: true })} />
                    {errors.firstName && <span>Это поле обязательно</span>}
                </StyledFieldGrid>
                <StyledFieldGrid item xl={4} md={4} xs={12}>
                    <input placeholder={'Отчество'} {...register("middleName")} />
                </StyledFieldGrid>
                <StyledFieldGrid item xl={4} md={4} xs={12}>
                    <input placeholder={'Город'} {...register("city", { required: true })} />
                    {errors.city && <span>Это поле обязательно</span>}
                </StyledFieldGrid>
                <StyledFieldGrid item xl={4} md={4} xs={12}>
                    <input placeholder={'Адрес СДЭК'} {...register("address", { required: true })} />
                    {errors.address && <span>Это поле обязательно</span>}
                    <NoteText>Доставка оплачивается самостоятельно в пункте выдачи Сдэк (500₽)</NoteText>
                </StyledFieldGrid>


                <StyledFieldGrid item xl={4} md={4} xs={12}>
                    <input placeholder={'Номер телефона'} {...register("phoneNumber", { required: true })} />
                    {errors.phoneNumber && <span>Это поле обязательно</span>}
                </StyledFieldGrid>
                <StyledFieldGrid item xl={6} md={6} xs={12}>
                    <input placeholder={'Email'} {...register("email", { required: true, pattern: /^\S+@\S+\.\S+$/ })} />
                    {errors.email && <span>Введите корректный email</span>}
                </StyledFieldGrid>
                <StyledFieldGrid item xl={6} md={6} xs={12}>
                    <input placeholder={'Комментарий к заказу'} {...register("comment")} />
                </StyledFieldGrid>
            </Grid>

            <Grid container alignItems="center" justifyContent="flex-end">
                <StyledButton sx={{ textTransform: 'none' }} type="submit"><span style={{ borderBottom: '0.9px solid #666' }}>Оплатить →</span></StyledButton>
            </Grid>
        </StyledForm>
    );
};


const StyledBackButton = styled.div`
  
  margin-bottom: 4vw;
  top: 30px;
  z-index: 10;
  display: flex; /* Включаем Flexbox */
  justify-content: center; /* Горизонтальное центрирование */

  button {

    font-size: calc(0.7vw + 10px);
    font-family: 'Fira Mono', monospace;
    background-color: ${theme.mainBackgroundColor};
    color: ${theme.mainTextColor};

    &:hover {
      background-color: transparent;
      color: ${theme.secondaryTextColor};
      box-shadow: none;
    }
  @media (max-width: 768px) {
  font-size: 2.5vw;
  }

   @media (max-width: 560px) {
   font-size: 3vw;
  }



`;


const NoteText = styled.div`
  margin-top: 8px;
  font-family: 'NEXT ART', sans-serif !important;
  font-weight: 400;
  /* аккуратная адаптивка */
  font-size: clamp(11px, 1.15vw, 14px);
  line-height: 1.4;
  color: rgba(77, 77, 77, 0.55);

  /* чуть компактнее на очень узких */
  @media (max-width: 492px) {
    font-size: clamp(11px, 3.4vw, 13px);
    margin-top: 6px;
  }
`;


const StyledForm = styled.form`
  flex-grow: 1;
  width: 70%;
  font-family: 'NEXT ART', sans-serif !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto auto;
  padding: 20px;

  button {
    font-family: "Fira Mono", monospace;
  }

  input {
    font-family: 'NEXT ART', sans-serif !important;
  }
`;

const StyledButton = styled(Button)`
  && {
    font-size: calc(0.7vw + 10px);
    background-color: ${theme.mainBackgroundColor};
    color: ${theme.mainTextColor};
    border-radius: 8px;
    padding-top: 1vw;
    margin-top: 3vw;

    &:hover {
      background-color: transparent;
      color: ${theme.mainTextColor};
      box-shadow: none;
    }

  @media (max-width: 768px) {
  font-size: 2.5vw;
  }

   @media (max-width: 560px) {
   font-size: 3vw;
  }

    
  }
`;

const StyledFieldGrid = styled(Grid)`
    margin-bottom: 50px;

    input {
        font-size: calc(0.8vw + 7px);
        border: none;
        outline: none;
        border-bottom: 1px solid ${theme.secondaryTextColor};
        background-color: ${theme.mainBackgroundColor};
        width: 100%;
        padding: 8px 0 5px 0;
        color: black;           
        transition: border-bottom-color 0.3s, border-bottom-width 0.3s; /* Плавный переход для линии */

        &:focus {
            outline: none;
            border-bottom: 2px solid ${theme.mainTextColor}; /* Линия становится толще и темнее */
        }

      
        /* Убираем стили автозаполнения */
        &:-webkit-autofill {
             -webkit-box-shadow: 0 0 0 1000px ${theme.mainBackgroundColor} inset;
            -webkit-text-fill-color: black;
        }
              @media (max-width: 768px) {
             font-size: calc(0.8vw + 10px);
             }


   
    }

    span {
        color: rgba(204, 5, 5, 0.74);
        font-size: 12px;
    }
`;



export default OrderForm;
