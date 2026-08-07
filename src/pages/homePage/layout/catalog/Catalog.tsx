import * as React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../../../_globalStyles/theme';
import { ProductType } from "../../../../store/useProducts";
import { forwardRef } from 'react';

type CatalogProps = {
  products: ProductType[];
};

export const Catalog = forwardRef<HTMLDivElement, CatalogProps>(({ products }, ref) => {
  const navigate = useNavigate();

  const imageUrls: { [key: string]: { desktop: string; mobile: string } } = {
    valentineHim: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/valentine_him.jpg', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/valentine_him.jpg' 
    },
    valentineHer: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/valentine_her.jpg', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/valentine_her.jpg' 
    },
    jacket: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/jacket.jpg', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/jacket.jpg' 
    },
    corset: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/corset1.png', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/corset2.png' 
    },
    dress: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/dress.jpg', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/dress.jpg' 
    },
    batistSet: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/batist_big.jpg', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/batist_big.jpg' 
    },
    skirt: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/skirt.jpg', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/skirt.jpg' 
    },
    whitePodium: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/white_podium1.jpg', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/white_podium1.jpg' 
    },

    blackCorset: {
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/black_corset1.jpg',
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/black_corset1.jpg'
    },

    bluePodium: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/blue_podium1.jpg', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/blue_podium1.jpg' 
    },
    whitePodium4: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/white_podium4.jpg', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/white_podium4.jpg' 
    },
    whitePodium5: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/white_podium5.jpg', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/white_podium5.jpg' 
    },
    blueShirt: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/blue_shirt.jpg', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/blue_shirt.jpg' 
    },
    daisyDress: { 
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/daisy_dress.png', 
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/daisy_dress.png' 
    },
    blackOdille: {
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/product_detail_photos/black_odille.png',
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/product_detail_photos/black_odille.png'
    },
    whiteOdette: {
      desktop: 'https://vyacheslavnabrand.ru/SOURCE/images/product_detail_photos/white_odette.png',
      mobile: 'https://vyacheslavnabrand.ru/SOURCE/images/product_detail_photos/white_odette.png'
    },


  };

  const handleCardClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  return (
    <StyledCatalog ref={ref}>
      <TopRow>
        {/* Левая колонка с подиумным платьем и корсетом */}
        <LeftColumn>
          <SmallCard key={'15'} onClick={() => handleCardClick('15')}>
            <Image src={imageUrls.whiteOdette.desktop} alt="Блузка Odette" />
            <Title>Блузка Одетт →</Title>
          </SmallCard>
          
          {/* Карточка корсета с разными изображениями */}
          <CorsetCard key={'corset'} onClick={() => handleCardClick('3')}>
            <picture>
              <source media="(min-width: 769px)" srcSet={imageUrls.corset.desktop} />
              <source media="(max-width: 768px)" srcSet={imageUrls.corset.mobile} />
              <CorsetImage 
                src={imageUrls.corset.desktop} 
                alt="Корсет" 
              />
            </picture>
            <Title>Корсет "Белый лебедь" →</Title>
          </CorsetCard>
        </LeftColumn>

        <DoubleCard>
          <MediumCard key={'13'} onClick={() => handleCardClick('13')}>
            <Image src={imageUrls.blackCorset.desktop} alt="Корсет Black Swan" />
            <Title>Корсет "Черный лебедь" →</Title>
          </MediumCard>


          <MediumCard key={'14'} onClick={() => handleCardClick('14')}>
            <Image src={imageUrls.blackOdille.desktop} alt="Блузка Odille" />
            <Title>
              Блузка Одиль → <br />
            </Title>
          </MediumCard>
        </DoubleCard>
      </TopRow>

      <BottomRow>
        <GroupedCardContainer>
          <Image src={imageUrls.batistSet.desktop} alt="Batist Set" />
          <BatistTitle>Набор из батиста</BatistTitle>
          <GroupedButtons>
            <Title onClick={() => handleCardClick('4')}>Рубашка →</Title>
            <Title onClick={() => handleCardClick('5')}>Юбка →</Title>
          </GroupedButtons>
        </GroupedCardContainer>

        <StackedCard>
          <MediumCard onClick={() => handleCardClick('6')}>
            <Image src={imageUrls.blueShirt.desktop} alt="Blue" />
            <Title>Рубашка приталенная →</Title>
          </MediumCard>

          <MediumCard onClick={() => handleCardClick('12')}>
            <Image src={imageUrls.daisyDress.desktop} alt="Daisy" />
            <Title>Платье Дейзи →</Title>
          </MediumCard>
        </StackedCard>
      </BottomRow>
    </StyledCatalog>
  );
});

Catalog.displayName = "Catalog";

const StyledCatalog = styled.section`
  display: flex;
  flex-direction: column;
  gap: 6vw;
  margin: 7vw;
  margin-top: 10vw;
  padding: 2vw;
  max-width: 100vw;

  @media (max-width: 768px) {
    gap: 5vw;
  }
`;

const TopRow = styled.div`
  display: flex;
  gap: 8vw;
  align-items: flex-start;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Новая левая колонка для подиумного платья и корсета
const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4vw;
  width: 12vw;

  @media (max-width: 768px) {
    width: 100%;
    gap: 5vw;
  }
`;

// Специальная карточка для корсета
const CorsetCard = styled.div`
  width: 12vw;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

// Изображение корсета
const CorsetImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: center;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10vw;
  margin-top: 6vw;

  @media (max-width: 768px) {
    margin-top: -4vw;
    flex-direction: column;
  }
`;

const SmallCard = styled.div`
  width: 12vw;
  height: 20vw;
  cursor: pointer;
  margin-top: 5vw;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    margin-top: 0;
  }
`;

const MediumCard = styled.div`
  width: 25vw;
  height: 35vw;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    margin: 2vw auto;
  }
`;

const GroupedCardContainer = styled.div`
  width: 40vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2vw;
  margin-top: 8vw;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    margin-bottom: -2vw;
  }
`;

const DoubleCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 5vw;
  width: fit-content;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    gap: 2vw;
  }
`;

const GroupedButtons = styled.div`
  width: 100%;
  display: flex;
  gap: 3vw;
`;

const StackedCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8vw;
  width: 25vw;
  margin-top: 3vw;

  @media (max-width: 768px) {
    width: 100%;
    gap: 5vw;
    margin-top: 0vw;
  }
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: center;
`;

const ValentineLabel = styled.span`
  color: rgb(174, 12, 12);
  font-weight: 500;
  display: inline-block;
  text-align: left;
  width: 100%;
`;

export const Title = styled.h3`
  display: inline-block;
  font-family: "Fira Mono", monospace;
  font-size: calc(1vw + 3px);
  font-weight: 400;
  margin-top: 1rem;
  color: black;
  border-bottom: 1px solid ${theme.secondaryTextColor};

  &:hover {
    cursor: pointer;
  }

  @media (max-width: 768px) {
    font-size: 2.5vw;
  }

  @media (max-width: 560px) {
    font-size: 3.5vw;
  }
`;

export const BatistTitle = styled.h3`
  white-space: nowrap;
  font-family: "Fira Mono", monospace;
  font-size: calc(1.2vw + 5px);
  font-weight: 400;
  text-align: left;
  margin-top: 1rem;
  color: black;
  width: 100%;

  &:hover {
    cursor: pointer;
  }

  @media (max-width: 768px) {
    font-size: 2.5vw;
  }

  @media (max-width: 560px) {
    font-size: 3.5vw;
  }
`;