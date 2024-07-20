import * as React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from '@mui/material';
import { useBasket } from "../../components/BasketContext";
import { useNavigate } from 'react-router-dom';
import {ProductType} from "../../App";

type Props = {};

export const Basket = (props: Props) => {
	const { basket, removeProductToBasket } = useBasket();
	const navigate = useNavigate();

	const handleOrderClick = () => {
		// Передача товаров и суммы заказа через navigate
		navigate('/order', {
			state: {
				products: Object.values(groupedBasket),
				total: totalBasket
			}
		});
	};

	// Сгруппируем товары по их ID
	const groupedBasket = basket.reduce((acc, product) => {
		if (acc[product.id]) {
			acc[product.id].quantity += 1;
		} else {
			acc[product.id] = { ...product, quantity: 1 };
		}
		return acc;
	}, {} as Record<string, ProductType & { quantity: number }>);

	let totalBasket: number = 0;

	return (
		<StyledBasket>
			<div>Корзина</div>
			{basket.length === 0 ? (
				<EmptyBasket>Ваша корзина пуста</EmptyBasket>
			) : (
				<ProductList>
					{Object.values(groupedBasket).map((product) => {
						totalBasket += product.price * product.quantity;
						return (
							<ProductCard key={product.id}>
								<ProductImage src={product.imgUrl} alt={product.title} />
								<ProductDetails>
									<ProductTitle>{product.title}</ProductTitle>
									<ProductPrice>{product.price * product.quantity}₽</ProductPrice>
									<ProductQuantity>{product.quantity} шт</ProductQuantity>
								</ProductDetails>
								<StyledButton onClick={() => removeProductToBasket(product.id)}>x</StyledButton>
							</ProductCard>
						);
					})}
				</ProductList>
			)}
			<SummaryDiv>
				<span>Всего: {totalBasket}₽</span>
				<StyledButton onClick={handleOrderClick}>Оформить заказ</StyledButton>
			</SummaryDiv>
		</StyledBasket>
	);
};

const StyledBasket = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const EmptyBasket = styled.div`
  font-size: 24px;
  margin-top: 20px;
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

const ProductCard = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ProductImage = styled.img`
  width: 100px;
  height: 150px;
  object-fit: cover;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductTitle = styled.h3`
  margin: 0;
`;

const ProductPrice = styled.p`
  margin: 5px 0;
  font-size: 18px;
  color: ${theme.mainTextColor};
`;

const ProductQuantity = styled.p`
  margin: 5px 0;
  font-size: 18px;
  color: ${theme.secondaryTextColor};
`;

const StyledButton = styled(Button)`
  && {
    font-size: 16px;
    background-color: ${theme.mainBackgroundColor};
    color: ${theme.secondaryTextColor};
    border-radius: 8px;
    padding: 8px 16px;

    &:hover {
      background-color: transparent;
      color: ${theme.mainTextColor};
      box-shadow: none;
    }
  }
`;

const SummaryDiv = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Basket;
