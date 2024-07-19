import * as React from 'react';
import styled from 'styled-components';
import {useParams, useNavigate} from 'react-router-dom';
import {ProductType} from '../../../../../App';
import {Button} from '@mui/material';
import {theme} from '../../../../../styles/theme';
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import {GlobalStyle} from '../../../../../styles/GlobalStyle';

type ProductDetailProps = {
	products: ProductType[]
}
const ProductDetail = ({products}: ProductDetailProps) => {
	const {id} = useParams<{ id: string }>();
	const product = products.find((product) => product.id === id);
	const navigate = useNavigate();


	const galleryRef = React.useRef<ImageGallery>(null);

	if (!product) {
		return <div>Product not found</div>;
	}

	const images = [
		{
			original: product.imgUrl,
			thumbnail: product.imgUrl,
		},
		{
			original: product.imgUrl,
			thumbnail: product.imgUrl,
		},
		{
			original: product.imgUrl,
			thumbnail: product.imgUrl,
		},
	];

	const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = (e.target as HTMLDivElement).getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const width = rect.width;

		if (clickX < width / 2) {
			// Clicked on the left half
			galleryRef.current?.slideToIndex(galleryRef.current?.getCurrentIndex() - 1);
		} else {
			// Clicked on the right half
			galleryRef.current?.slideToIndex(galleryRef.current?.getCurrentIndex() + 1);
		}
	};

	return (
		<StyledProductDetail>
			<GlobalStyle/>
			<StyledButton onClick={() => navigate(-1)}>Вернуться</StyledButton>
			<StyledImageGalleryWrapper onClick={handleImageClick}>
				<ImageGallery
					ref={galleryRef}
					items={images}
					showPlayButton={false}
					showFullscreenButton={false}
					showNav={false}
					showThumbnails={true}
					infinite={true}
					autoPlay={false}
					slideDuration={550}
				/>
			</StyledImageGalleryWrapper>
			<Title>{product.title}</Title>
			<Price>{product.price}₽</Price>
			<Sizes>Доступные размеры: {product.size}</Sizes>
			<Compound>Состав: {product.compound}</Compound>
			<StyledButton>Добавить в корзину</StyledButton>
		</StyledProductDetail>
	);
};

const StyledProductDetail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const StyledImageGalleryWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 20px 0;
`;

const Title = styled.h2`
  margin: 20px 0;
`;

const Price = styled.p`
  font-size: 20px;
  margin: 10px 0;
`;

const Sizes = styled.p`
  margin: 10px 0;
`;

const Compound = styled.p`
  margin: 10px 0;
`;

const StyledButton = styled(Button)`
  && {
    font-size: 16px;
    background-color: ${theme.mainBackgroundColor};
    color: ${theme.mainTextColor};
    border-radius: 8px;
    padding: 8px 16px;

    &:hover {
      background-color: transparent;
      color: ${theme.secondaryTextColor};
      box-shadow: none;
    }
  }
`;

export default ProductDetail;