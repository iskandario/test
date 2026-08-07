import * as React from "react";
import styled from "styled-components";
import { theme } from "../../_globalStyles/theme";
import { Button, MenuItem, Select } from "@mui/material";
import { useBasket } from "./BasketContext";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


const imageUrls: { [key: string]: string } = {
  "1": "https://vyacheslavnabrand.ru/SOURCE/images/catalog/pink_shirt1.jpg",
  "2": "https://vyacheslavnabrand.ru/SOURCE/images/catalog/jacket.jpg",
  "3": "https://vyacheslavnabrand.ru/SOURCE/images/product_detail_photos/corset1.png",
  "4": "https://vyacheslavnabrand.ru/SOURCE/images/catalog/shirt2.jpg",
  "5": "https://vyacheslavnabrand.ru/SOURCE/images/catalog/skirt1.jpg",
  "6": "https://vyacheslavnabrand.ru/SOURCE/images/catalog/blue_shirt_catalog.jpg",
  "7": "https://vyacheslavnabrand.ru/SOURCE/images/catalog/dress.jpg",
  "8": 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/valentine_him.jpg',
  "9": 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/valentine_her.jpg',
  "10": 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/white_podium1.jpg',
  "11": 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/blue_podium1.jpg',
  "12": 'https://vyacheslavnabrand.ru/SOURCE/images/catalog/daisy_dress.png',
  "13": "https://vyacheslavnabrand.ru/SOURCE/images/catalog/black_corset1.jpg",
  "14": "https://vyacheslavnabrand.ru/SOURCE/images/product_detail_photos/black_odille.png",
  "15": "https://vyacheslavnabrand.ru/SOURCE/images/product_detail_photos/white_odette.png",

};

type AvailabilityMap = {
  [key: string]: {
    size_s_quantity: number;
    size_m_quantity: number;
    size_c_quantity: number;
    size_l_quantity: number;
    size_i_quantity: number;
  };
};





export const Basket = () => {
  const { basket, updateProductQuantity, updateProductSize, removeProductToBasket } = useBasket();
  const navigate = useNavigate();
  const [availability, setAvailability] = React.useState<AvailabilityMap>({});
  const [notifications, setNotifications] = React.useState<Record<string, string>>({}); // Типизация

  const fetchProductAvailability = async () => {
    try {
      const response = await fetch("https://vyacheslavnabrand.ru/products.php");
      if (!response.ok) throw new Error("Ошибка загрузки данных");
      const products = await response.json();

      const availabilityMap: AvailabilityMap = products.reduce((acc: AvailabilityMap, product: any) => {
        acc[String(product.id)] = {
          size_s_quantity: product.size_s_quantity,
          size_m_quantity: product.size_m_quantity,
          size_c_quantity: product.size_c_quantity,
          size_l_quantity: product.size_l_quantity,
          size_i_quantity: product.size_i_quantity,
        };

        return acc;
      }, {});


      setAvailability(availabilityMap);
      console.log("Availability map:", availabilityMap["8"], availabilityMap["9"]);

    } catch (error) {
      console.error("Ошибка при запросе доступности:", error);
    }
  };

  // ДОБАВЬ эту функцию в компонент Basket, после fetchProductAvailability
  const handleRemoveWithReservation = async (product: any) => {
    // Освобождаем резерв если есть
    if (product.reservation_id) {
      try {
        await fetch(`https://vyacheslavnabrand.ru/release_reservation.php?reservation_id=${product.reservation_id}`);
      } catch (error) {
        console.error('Ошибка освобождения резерва:', error);
      }
    }

    // Удаляем из корзины
    removeProductToBasket(product.id, product.sizeSelect || "");
  };

  React.useEffect(() => {
    fetchProductAvailability();
  }, []);

  const handleOrderClick = () => {
    let allAvailable = true;
    const newNotifications: Record<string, string> = {};
    // Проверяем есть ли резервы
const hasReservations = basket.every(product => product.reservation_id);
if (!hasReservations) {
  alert('Некоторые товары потеряли резерв. Обновите корзину.');
  return;
}
    basket.forEach((product) => {
      const productAvailability = availability[product.id];
      if (!productAvailability || !product.sizeSelect) return;

      let availableQuantity = 0;

      if (product.sizeSelect === "S") {
        availableQuantity = productAvailability.size_s_quantity;
      } else if (product.sizeSelect === "M") {
        availableQuantity = productAvailability.size_m_quantity;
      } else if (product.sizeSelect === "L") {
        availableQuantity = productAvailability.size_l_quantity;
      } else if (product.sizeSelect === "Единый размер") {
        availableQuantity = productAvailability.size_c_quantity;
      } else if (product.sizeSelect === "Индивидуальный пошив") {
        availableQuantity = productAvailability.size_i_quantity;
      } else {
        availableQuantity = 0;
      }


      if (product.quantity > availableQuantity) {
        allAvailable = false;
        newNotifications[product.id] = `Доступно только ${availableQuantity} шт.`;
      }
    });

    setNotifications(newNotifications);

    if (!allAvailable) {
      setTimeout(() => setNotifications({}), 3000); // Очистка уведомлений через 3 секунды
    } else {
      const total = basket.reduce((sum, product) => sum + product.price * product.quantity, 0);
      navigate("/order", {
        state: {
          products: basket,
          total,
        },
      });
    }
  };

  const isSizeAvailable = (productId: string, size: string) => {
    const productAvailability = availability[productId];
    if (!productAvailability) return false;

    if (size === "S") return productAvailability.size_s_quantity > 0;
    if (size === "M") return productAvailability.size_m_quantity > 0;
    if (size === "L") return productAvailability.size_l_quantity > 0; // ✅ ДОБАВЬ
    if (size === "Единый размер") return productAvailability.size_c_quantity > 0;

    return false;
  };


  return (
    <StyledBasket>
      <StyledBackButton>
        <BackButton />
      </StyledBackButton>
      <BasketTitle>КОРЗИНА</BasketTitle>
      {basket.length === 0 ? (
        <EmptyBasket>Ваша корзина пуста</EmptyBasket>
      ) : (
        <BasketTable>
          <TableHeader>
            <ColumnProduct>Товар</ColumnProduct>
            <ColumnSize>Размер</ColumnSize>
            <ColumnKolvo>Кол-во</ColumnKolvo>
            <ColumnPriceHead>Цена</ColumnPriceHead>
            <Column />
          </TableHeader>
          {basket.map((product) => (
            <TableRow key={`${product.id}-${product.sizeSelect}`}>

              <ImageContainer>
                <ProductImage src={imageUrls[product.id]} alt={product.title} />
              </ImageContainer>

              <DetailsContainer>
                <TitleCompoundWrapper>
                  <ProductTitle>{product.title}</ProductTitle>
                  <ProductCompound>{product.compound}
                    {notifications[product.id] && (
                      <StyledNotification>{notifications[product.id]}</StyledNotification>
                    )}
                  </ProductCompound>

                </TitleCompoundWrapper>

                <SelectorsColumn>
                  {product.sizes.length === 1 ? (
                    // Если размер только один, отображаем черточку
                    <SingleSize>Единый размер</SingleSize>
                  ) : (
                    // Если размеров несколько, отображаем Select
                    <StyledSelect
                      value={product.sizeSelect}
                      onChange={(e) =>
                        updateProductSize(product.id, product.sizeSelect || "", e.target.value as string)
                      }
                      displayEmpty
                      IconComponent={KeyboardArrowDownIcon}
                    >
                      {product.sizes.map((size) => (
                        <StyledMenuItem key={size} value={size}
                          disabled={!isSizeAvailable(product.id, size)}

                          sx={{
                            '&.Mui-selected': {
                              backgroundColor: '#bcbcbc30',
                            },
                          }}>
                          {size}
                        </StyledMenuItem>
                      ))}
                    </StyledSelect>
                  )}
                </SelectorsColumn>
                <Column>
                  <QuantityWrapper>
                    <QuantityControl>
                      <QuantityButton
                        onClick={() =>
                          updateProductQuantity(product.id, product.sizeSelect || "", product.quantity - 1)
                        }
                      >
                        -
                      </QuantityButton>
                      <Quantity>{product.quantity}</Quantity>
                      <QuantityButton
                        onClick={() =>
                          updateProductQuantity(product.id, product.sizeSelect || "", product.quantity + 1)
                        }
                      >
                        +
                      </QuantityButton>
                    </QuantityControl>
                  </QuantityWrapper>


                </Column>
                <ColumnPrice>{product.price * product.quantity}₽</ColumnPrice>

              </DetailsContainer>

              <RemoveButtonContainer>

                <RemoveButton
                  onClick={() => handleRemoveWithReservation(product)}
                >
                  ×
                </RemoveButton>
              </RemoveButtonContainer>

            </TableRow>
          ))}
        </BasketTable>
      )}
      <SummaryDiv>
        <StyledFooter>
          <TotalText>
            Всего:{" "}
            {basket.reduce((sum, product) => sum + product.price * product.quantity, 0)}₽ /
          </TotalText>
          {basket.length > 0 && ( // Проверка на пустоту корзины
            <StyledButton sx={{ textTransform: "none" }} onClick={handleOrderClick}>
              Оформить сейчас
            </StyledButton>
          )}
        </StyledFooter>
      </SummaryDiv>
    </StyledBasket>
  );
};


const StyledNotification = styled.div`
  position: absolute;
  top: 2vw;
  left: 0;
  font-size: calc(0.7vw + 5px); 
  color: #ff6b6b; 
  font-family: "Mira Mono", monospace;
  opacity: 0.9;
  white-space: nowrap; /* Отключаем перенос строк */
  transition: opacity 0.3s ease;

  @keyframes fadeOut {
    0% {
      opacity: 0.9;
    }
    100% {
      opacity: 0;
    }
  }


  @media(max-width: 768px){
  font-size: calc(0.7vw + 8px); 
  top: 4vw;
  }


   @media(max-width: 508px){
  font-size: calc(0.6vw + 7px); 
  top: 3vw;
  }
`;
const StyledBasket = styled.div`
  font-family: "NEXT ART", sans-serif !important;
  font-weight: 500;
  line-height: 1.5;
  button {
    font-family: "Fira Mono", monospace;
  }
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-top: 0px;

 


`;
const StyledMenuItem = styled(MenuItem)`
  && {
   font-size: 1.2vw;
   font-family: "Fira Mono", monospace;
    text-align: center;
    color: ${theme.mainTextColor}; 
        box-shadow: none; /* Убираем тень */

    transition: background-color 0.3s ease, color 0.3s ease; /* Плавные эффекты при наведении */
    
    &:hover {
      
      color: ${theme.secondaryTextColor}; /* Цвет текста при наведении */
    }

    @media (max-width: 768px) {
   font-size: 2vw;
    }


      @media (max-width: 508px) {
   font-size: 2.5vw;
    }
  }
`;

const ColumnKolvo = styled.div`
 text-align: center;
  font-size: 1.2vw;
  padding-right: 7vw;
  color: #C0C0C0;  

  @media (max-width: 1200px) {
    padding-right: 10vw;

  }
`;

const ColumnPriceHead = styled.div`
  text-align: center;
  font-size: 1.2vw;
  padding-right: 12vw;
  color: #C0C0C0;  
`;


const ImageContainer = styled.div`
  flex: 0 0 auto; /* Фиксированная ширина для картинки */
  margin-left: 5vw;
  margin-bottom: 5vw;
  width: 15vw;
  height: 120px;

  @media (max-width: 768px) {
    width: 25%;
    height: auto; /* Позволяем масштабироваться */
    display: flex;
    align-items: center;
  }

  @media (max-width: 1200px) {
  margin-bottom: 3vw;
  }
`;

const DetailsContainer = styled.div`
 display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr; /* Три колонки: название, описание и дополнительные элементы */
  column-gap: 2vw; /* Расстояние между колонками */
  align-items: center; /* Центрируем элементы по вертикали */
  max-width: 100%; 

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column; /* Столбик для деталей */
    align-items: flex-start;
    flex: 2; /* Делаем шире в мобильной версии */
    gap: 15px;
    margin-top:-2vw;
  }

    @media (max-width: 630px) {
    gap: 10px;
    margin-top:0vw;
  }

    @media (max-width: 520px) {
    gap: 5px;
    margin-top:0vw;
  }
     @media (max-width: 420px) {
    gap: 1px;
    margin-top:2vw;
  }


`;
const RemoveButtonContainer = styled.div`
  flex: 0 0 auto;
  position: static; /* Обычное позиционирование на десктопе */

  @media (max-width: 768px) {
    position: absolute;
    top: 1vw;
    right: -5vw;
  }

   @media (max-width: 660px) {
    position: absolute;
    top: 2vw;
    right: -6vw;
  }


    @media (max-width: 460px) {
    position: absolute;
    top: 3vw;
    right: -8vw;
  }
`;

const SingleSize = styled.div`
  width: 8.6vw; /* Совпадает с StyledSelect */
  height: 4.5vw; /* Совпадает с StyledSelect */
  font-size: 1.2vw;
  margin-top: 0vw;
  font-family: NEXT ART;
  text-align: center;
  background-color: transparent;
  color: #C0C0C0;  
  display: flex;
  align-items: center;
  justify-content: center;

   @media (max-width: 768px) {
    margin-top: 4vw;
    margin-bottom: 4vw;
    font-size: 3vw;
    width: 100%;
  }
`;


const ColumnPrice = styled.div`
  margin-top: -1vw;
  text-align: right;
  font-weight: bold;
  font-size: 1.3vw;

    @media (max-width: 768px) {
 
    font-size: 2.6vw;
  }


`;

const TitleCompoundWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1; 
  height: 100%; 
  gap: 0.5vw;

   @media (max-width: 768px) {
   gap: 3vw;
   margin-bottom: 3vw;
}

     @media (max-width: 420px) {
     gap: 0vw;
}


`;

const ProductTitle = styled.div`
  font-weight: bold;
  color: #313131;
  font-size: 1.2vw;
  text-align: left; 
  max-width: 100%;

 @media (max-width: 768px) {
      margin-top: 4vw;
      height: 50px;
      font-size: 2.7vw;
      margin-bottom: -6vw;
    }

     @media (max-width: 508px) {
    
      margin-bottom: -8vw;
    }
`;

const ProductCompound = styled.p`
  position: relative;
  font-size: 1vw;  
  color: #C0C0C0;
  text-align: left; /* Выравнивание текста */
  margin: 0; /* Убираем лишние отступы */
  word-wrap: break-word; 
  overflow-wrap: anywhere; 

   @media (max-width: 768px) {
      font-size: 2.3vw;
    }
`;

const StyledBackButton = styled.div`
  top: 30px;
  z-index: 10;
  margin-bottom: 1vw;
  display: flex; /* Включаем Flexbox */
  justify-content: center; /* Горизонтальное центрирование */

  button {

    font-size: calc(0.8vw + 5px);
    font-family: 'Fira Mono', monospace;
    background-color: ${theme.mainBackgroundColor};
    color: ${theme.mainTextColor};

    &:hover {
      background-color: transparent;
      color: ${theme.secondaryTextColor};
      box-shadow: none;
    }
      @media (max-width: 768px) {
    font-size: calc(1.2vw + 5px);
    }
  }

    
`;


const StyledSelect = styled(Select)`
  && {
    width: 8.6vw; 
    height: 4vw; 
    box-sizing: border-box;
    font-size: 1.2vw;
    font-weight: bold;
    font-family: "Fira Mono", monospace;
    text-align: center;
    border: 1px solid rgba(209, 209, 209, 0.5); 
    
    background-color: transparent; 
    box-shadow: none; 
    padding: 0px 10px;

    & .MuiOutlinedInput-notchedOutline {
      border: none;
    }

  

    &:focus-visible {
      outline: none;
    }

    & .MuiSelect-icon {
      position: absolute; 
      top: 1.3vw;
      right: 0.9vw;
      width: 2.3vw;
    }



      @media (max-width: 1600px) {
      & .MuiSelect-icon {
         width: 2.1vw;
         top: 1vw; 
         right: 1vw;  
         }
      }

   @media (max-width: 1400px) {
      & .MuiSelect-icon {
         width: 2.1vw;
         top: 1vw; 
         right: 1vw;  
         }
      }



    @media (max-width: 1200px) {
      & .MuiSelect-icon {
         width: 2.1vw;
         top: 0.8vw; 
         right: 1vw;  
         }
      }


     @media (max-width: 868px) {
      & .MuiSelect-icon {
         width: 2.1vw;
         top: 0.4vw; 
         right: 1vw;  
         }
      }

      @media (max-width: 768px) {
      & .MuiSelect-icon {
         width: 3.3vw;
         top: 1.8vw; 
         right: 2.5vw;  
         }
      }


      @media (max-width: 568px) {
      & .MuiSelect-icon {
         width: 3.7vw;
         top: 0.8vw; 
         right: 2.5vw;  
      }
      } 


       @media (max-width: 408px) {
      & .MuiSelect-icon {
         width: 3.7vw;
         top: 0.1vw; 
         right: 2.5vw;  
      }

   }



    & .MuiSelect-select {
      color: rgba(0, 0, 0, 0.87);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: normal;
    }

    @media (max-width: 768px) {
      height: 8vw;
      width: 30vw;
      font-size: 2.5vw;
      margin-bottom: 3vw;


      & .MuiSelect-select {
            margin-left: -10vw;
}

    }

  }
`;

const BasketTitle = styled.h1`
  font-size: 2.5vw;
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;

 @media (max-width: 768px) {
  font-size: 5.5vw;
  }

`;

const EmptyBasket = styled.div`
  font-size: 1.8vw;  
  margin-top: 20px;
  display: flex;
  align-items:center; 
  justify-content: center;


  @media (max-width: 900px) {
    font-size: 3vw;  
  }
`;

const BasketTable = styled.div`
  width: 100%;
`;

const TableHeader = styled.div`
  display: grid;
  width: 90%;
  grid-template-columns: 1.1fr 0.5fr 0.5fr 0.5fr;
  margin-left: 10vw;
  padding: 15px;
  font-size: 10vw;

   @media (max-width: 768px) {
    display: none; /* Скрываем названия столбцов на мобильных */
  }



`;

const TableRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20px 0;
  margin-left: 5vw;
  width: 90%;
  justify-content: space-between;

   @media (max-width: 768px) {
    display: flex; /* Меняем с grid на flex */
    flex-direction: row; /* Структура превращается в столбец */
    gap: 20vw;
    margin-left: 0;
    position: relative; /* Для позиционирования кнопки удаления */
  }
 
 

`;


const Column = styled.div`
  text-align: center;
  font-size: 1vw;
  color: #C0C0C0;   

`;

const ColumnProduct = styled(Column)`
  text-align: left; 
  font-size: 1.2vw;

`;

const ColumnSize = styled.div`
  text-align: center;
  font-size: 1.2vw;
  padding-left: 4vw;
  color: #C0C0C0; 
  
  @media (max-width: 1200px) {
  padding-left: 1vw;
  }
`


const SelectorsColumn = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;




const ProductImage = styled.img`
  width: 10vw;
  height: auto;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 30vw;
    height: auto;
  }
    @media (min-width: 930px){
    width: 8vw;
    }
    @media (min-width: 1100px){
    width: 8vw;
    }
`;


const QuantityWrapper = styled.div`
  display: flex;
  justify-content: center; /* Центрируем по горизонтали */
  padding: 10px 0;

  @media (max-width: 768px) {
    justify-content: space-between; /* Меняем выравнивание для небольших экранов */
    padding: 5px 0;
  }
`;

const QuantityControl = styled.div`
    width: 8.6vw; 
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(209, 209, 209, 0.5);
  padding: 10px 10px;
  justify-content: center;
  height: 4vw;
  box-sizing: border-box;

  @media (max-width: 768px) {
      height: 8vw;
      width: 30vw;
            margin-bottom: 3vw;


  }
`;

const QuantityButton = styled(Button).attrs(() => ({
  disableRipple: true, // Отключает ripple-эффект
  disableTouchRipple: true, // Отключает ripple-эффект на мобильных устройствах
}))`
  && {
    background-color: transparent;
    color: #C0C0C0;   
    min-width: 40px;
    min-height: 40px;
    font-size: 1.5vw;
    font-weight: normal;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -0.5vw;
     margin-right: -0.5vw;
    transition: transform 0.2s ease, color 0.2s ease;



    &:hover {
      background-color: transparent;
      color: black;
    }


     &:active {
      transform: scale(0.95); /* Визуальный эффект нажатия */
    }
  
    &:focus {
  outline: none; /* Убираем стандартное выделение */
}


   
     @media (max-width: 1200px) {
      font-size: 2vw;
      margin-left:-0.5vw;
      margin-right:-0.5vw;
    }

    @media (max-width: 1100px) {
      font-size: 2vw;
      margin-left:-1vw;
      margin-right:-1vw;
    }

    @media (max-width: 1000px) {
      font-size: 2vw;
      margin-left:-1vw;
      margin-right:-1vw;
    }

     @media (max-width: 768px) {
      font-size: 4vw;
      margin-left: 5vw;
      margin-right: 5vw;
    }

      @media (max-width: 658px) {
      font-size: 4vw;
      margin-left: 3vw;
      margin-right: 3vw;
    }
         @media (max-width: 508px) {
      font-size: 5vw;
      margin-left: 1vw;
      margin-right: 1vw;
    }
  }
`;

const Quantity = styled.span`
  font-size: 1.3vw;
  color: #333;
  font-weight: normal;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 3vw;
  }
`;
export const RemoveButton = styled(Button)`
  &&{
    margin-bottom: 1vw;
    margin-left: 2vw;
    color: #C0C0C0;
    font-size: 3vw;
    font-weight: normal;

    &:hover {
      background-color: transparent;
      color: black;
    }
    @media (max-width: 768px) {
      font-size: 6vw;
       margin-bottom: 2vw;
       margin-left: 5vw;
    }
}
  
`;

const SummaryDiv = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  justify-content: space-around;
`;

const TotalText = styled.span`
  font-size: 1.3vw;
  font-family: 'Fira Mono', monospace;
  font-weight: 500;


      @media (max-width: 768px) {
      font-size: 3vw;
}

    
`;

const StyledButton = styled(Button)`
  && {
    font-size: 1.3vw;
    background-color: ${theme.mainBackgroundColor};
    color: ${theme.mainTextColor};
    border-radius: 8px;
    padding: 8px 16px;
    padding-left: 0px;
    font-family: "Fira Mono", monospace;
    font-weight: 500;


    &:hover {
      background-color: transparent;
      color: ${theme.mainTextColor};
      box-shadow: none;
    }
         &::after {
      content: ''; /* Обязательно для псевдоэлемента */
      position: absolute;

      bottom: 10px; /* Располагаем под текстом */
      width: 95%; 
      height: 1px; /* Толщина линии */
      background-color: #C0C0C0; 
    }

   

          @media (max-width: 768px) {
      font-size: 3vw;
     }

   


  }

  
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: center; /* Центрируем содержимое горизонтально */
  align-items: center; /* Центрируем содержимое вертикально */
  gap: 10px; /* Расстояние между текстом и кнопкой */
  margin-top: 20px; /* Отступ сверху */
`;





export default Basket;
