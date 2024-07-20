import * as React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from '@mui/material';
import { useForm } from "react-hook-form";
import { useLocation } from 'react-router-dom';
import {ProductType} from "../../App";

type OrderFormProps = {};

const OrderForm = (props: OrderFormProps) => {
	const { register, handleSubmit, formState: { errors } } = useForm();
	const location = useLocation();
	const { products, total } = location.state as {
		products: (ProductType & { quantity: number })[];
		total: number;
	};

	const onSubmit = (data: any) => {
		const orderData = {
			...data,
			products,
			total
		};
		console.log(orderData);
		// Здесь обрабатывать данные формы, например, отправить их на сервер
	};

	return (
		<StyledForm onSubmit={handleSubmit(onSubmit)}>
			<Field>
				<label>Фамилия</label>
				<input {...register("lastName", { required: true })} />
				{errors.lastName && <span>Это поле обязательно</span>}
			</Field>
			<Field>
				<label>Имя</label>
				<input {...register("firstName", { required: true })} />
				{errors.firstName && <span>Это поле обязательно</span>}
			</Field>
			<Field>
				<label>Отчество</label>
				<input {...register("middleName", { required: false })} />
			</Field>
			<Field>
				<label>Город</label>
				<input {...register("city", { required: true })} />
				{errors.city && <span>Это поле обязательно</span>}
			</Field>
			<Field>
				<label>Адрес Сдека</label>
				<input {...register("sdekAddress", { required: true })} />
				{errors.sdekAddress && <span>Это поле обязательно</span>}
			</Field>
			<Field>
				<label>Номер телефона</label>
				<input {...register("phoneNumber", { required: true })} />
				{errors.phoneNumber && <span>Это поле обязательно</span>}
			</Field>
			<Field>
				<label>Комментарий к заказу</label>
				<textarea {...register("comment", { required: false })} />
			</Field>
			<StyledButton type="submit">Оплатить</StyledButton>
		</StyledForm>
	);
};

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;

  label {
    margin-bottom: 5px;
  }

  input, textarea {
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  span {
    color: red;
    font-size: 12px;
  }
`;

const StyledButton = styled(Button)`
  && {
    font-size: 16px;
    background-color: ${theme.mainBackgroundColor};
    color: ${theme.mainTextColor};
    border-radius: 8px;
    padding: 8px 16px;
    margin-top: 20px;

    &:hover {
      background-color: transparent;
      color: ${theme.secondaryTextColor};
      box-shadow: none;
    }
  }
`;

export default OrderForm;
