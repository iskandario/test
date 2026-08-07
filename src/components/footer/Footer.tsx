// @flow 
import * as React from 'react';
import styled from "styled-components";
import {theme} from "../../_globalStyles/theme";

const media = {
  inst: 'instagram',
  tg: 'telegram'
};

type Props = {};

export const Footer = (props: Props) => {
  return (
    <StyledFooter>
     
    </StyledFooter>
  );
};

const StyledLink = styled.a`
  text-decoration: none; 
  color: inherit; 
  cursor: pointer;
`;

const LanguageSwitcher = styled.div`
  font-family: 'Fira Mono', monospace;
  font-size: calc(0.6vw + 5px);
  font-weight: 100;
  color: #333;
  display: block;

  /* Скрыть на мобильных */
  @media (max-width: 768px) {
    display: none;
  }

  span {
    cursor: default;
  }
`;

const RightAligned = styled.div`
  font-size: calc(0.6vw + 5px);
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: 20px;
  text-align: right; 

  small {
    font-family: 'NEXT ART', sans-serif;

    &.brand {
      display: block;
    }
  }

  @media (max-width: 768px) {
    small.made-by {
      font-family: 'Fira Mono', monospace; 
      font-size: calc(1.8vw + 5px);
      margin-bottom: 10px;
    }

    small.brand {
      display: none;
    }
  }
`;

const StyledFooter = styled.footer`
  font-family: 'NEXT ART', sans-serif !important;
  font-weight: 500;
  line-height: 1.5;
  padding-top: 2vw;
  padding-bottom: 38px;
  font-size: calc(0.5vw + 5px);
  margin-top: auto;

  min-height: 153px;
  display: flex;
  justify-content: center;

  & > div {
    display: flex;
    justify-content: space-around;
    width: 92.6%;
    border-bottom: thin solid ${theme.underlining};
  }

  @media (max-width: 768px) {
    & > div {
      border-bottom: none;
    }
  }
`;

const SocialMedia = styled.div`
  display: flex;
  font-size: calc(0.5vw + 5px);
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: 20px;
  text-align: left; 
  
  a {
    text-decoration: none;
    color: inherit;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    margin-top: auto; 
    font-size: calc(1.4vw + 5px);
    gap: 1px;
    color: grey;
  }
`;