import styled from "styled-components";
import Button from "@mui/material/Button";
import { theme } from "../../_globalStyles/theme";

export const StyledProductDetail = styled.div`
  font-family: 'NEXT ART', sans-serif !important;
  font-weight: 500;
  line-height: 1.5;
  display: flex;
  width: 100%; /* Гарантируем, что ширина адаптируется */
  flex-direction: column;
  align-items: center;
  padding-left: 5vw;
  padding-right: 5vw;


  margin: 0 auto;

  button {
    font-family: "Fira Code", monospace;
  }

 

`;

export const StyledImageGalleryWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 20px 0;
  display: flex;
`;

export const Title = styled.h2`
  margin-top: 4vw;
  margin-bottom: 10px;
  font-weight: 600;
  line-height: 1;
  font-size: calc(1.2vw + 5px);   
      @media (max-width: 768px) {
        margin-top: 1vw;
        font-size: 4.3vw;
}

`;

export const Price = styled.p`
  font-size: calc(1vw + 5px);
  font-weight: 600;
    margin: 0; 

   @media (max-width: 768px) {
    margin-top: 0vw; 
    align-self: flex-end;
    font-size: calc(2.3vw + 8px);
  }
`;

export const Compound = styled.p`
  margin-top: -15px; 
  margin-bottom: 30px;
  font-size: calc(0.7vw + 5px);   
  color: #C4C4C4;;   
        @media (max-width: 768px) {
          font-size: calc(1vw + 10px); 
          margin-top: 0;
          margin-bottom: 1vw;
}
     
`;

export const StyledButton = styled(Button)`
  && {
    font-size: 16px;
    background-color: ${theme.mainBackgroundColor};
    color: ${theme.mainTextColor};
    border-radius: 8px;
    font-family: "FiraMono", monospace;
    text-transform: none;


    &:hover {
      background-color: transparent;
      color: ${theme.secondaryTextColor};
      box-shadow: none;
    }
       &::after {
      content: ''; /* Обязательно для псевдоэлемента */
      position: absolute;

      bottom: -2px; /* Располагаем под текстом */
      width: 95%; /* Длина подчеркивания */
      height: 1px; /* Толщина линии */
      background-color: #C0C0C0; 
    }
  }
`;

