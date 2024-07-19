// Catalog.tsx
import * as React from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {ProductType} from "../../../../App";

type CatalogProps = {
	products: ProductType[]
};

export const Catalog = ({products}: CatalogProps) => {
	const navigate = useNavigate();

	const handleCardClick = (id: string) => {
		navigate(`/product/${id}`);
	};

	return (
		<StyledCatalog>
			{products.map(item => (
				<Card key={item.id} onClick={() => handleCardClick(item.id)}>
					<Image src={item.imgUrl} alt={item.title}/>
					<Title>{item.title} →</Title>
				</Card>
			))}
		</StyledCatalog>
	);
};

const StyledCatalog = styled.section`
  height: fit-content;
  display: flex;
  flex-wrap: wrap;
  gap: 109px;
  padding-left: 28.75%;
  padding-right: 21.6%;
`;

const Card = styled.div`
  width: fit-content;
  overflow: hidden;
  text-align: center;
  cursor: pointer; /* Добавляем курсор указателя */
`;

const Image = styled.img`
  width: 422px;
  height: 638px;
  object-fit: cover;
  object-position: center;
`;

const Title = styled.h3`
  &:hover {
    cursor: pointer;
  }

  margin: 16px 0;
`;