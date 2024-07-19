// HomePage.tsx
import * as React from 'react';
import styled from 'styled-components';
import {Main} from './layout/main/Main';
import {Catalog} from './layout/catalog/Catalog';
	import {ProductType} from "../../App";

type HomePageProps = {
	products: ProductType[]
}

export const HomePage = ({products}: HomePageProps) => {
	return (
		<StyledMainDiv>
			<Main/>
			<Catalog products={products}/>
		</StyledMainDiv>
	);
};

const StyledMainDiv = styled.div`
  & > section {
    outline: orangered 1px solid;
  }
`;