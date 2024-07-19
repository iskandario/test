import * as React from 'react';
import styled from "styled-components";

export const PageNotFound = () => {
	return (
		<StyledPageNotFound>
			<p>404:PAGE NOT FOUND</p>
		</StyledPageNotFound>
	);
};

const StyledPageNotFound = styled.div`
  width: 100%;
  height: 78.1vh;
	display: flex;
	justify-content: center;
	align-items: center;
	p {
		font-size: 50px;
	}
`