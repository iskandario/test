import * as React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from '@mui/material';
import { useBasket } from "../../components/BasketContext";
import { useNavigate } from 'react-router-dom';

type Props = {};

export const Basket = (props: Props) => {
	const { basket, removeProductToBasket } = useBasket();
	const navigate = useNavigate();

	const handleOrderClick = () => {
		navigate('/order');
	};

	return (
		<StyledBasket>
			<div>Корзина</div>
			{basket.length === 0 ? (
				<EmptyBasket>Ваша корзина пуста</EmptyBasket>
			) : (
				<ProductList>
					{basket.map((product) => (
						<ProductCard key={product.id}>
							<ProductImage src={product.imgUrl} alt={product.title} />
							<ProductDetails>
								<ProductTitle>{product.title}</ProductTitle>
								<ProductPrice>{product.price}₽</ProductPrice>
							</ProductDetails>
							<StyledButton onClick={() => removeProductToBasket(product.id)}>Remove</StyledButton>
						</ProductCard>
					))}
				</ProductList>
			)}
			<StyledButton onClick={handleOrderClick}>Оформить заказ</StyledButton>
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

export default Basket;
