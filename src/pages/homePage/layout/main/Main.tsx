// @flow
import * as React from 'react';
import styled from "styled-components";
import {StoreDescription} from "./store-description/StoreDescription";
import mainPhoto from '../../../../assets/images/mainPagePhoto.jpg'

export const Main = () => {
	return (
		<StyledMain>
			<PhotoWrapper><img src={mainPhoto} alt="Главное фото"/></PhotoWrapper>
			<StoreDescription/>
		</StyledMain>
	);
};

const PhotoWrapper = styled.div`
  height: 530px;
	width: 100%;
  background-color: rgba(0, 0, 0, 0.16);
	display: flex;
	justify-content: center;
	align-items: center;
	
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`

const StyledMain = styled.section`
	display: flex;
	flex-direction: column;
  min-height: 1082px;
`