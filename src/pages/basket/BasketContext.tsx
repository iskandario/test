import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ProductType } from "../../store/useProducts";

type BasketProductType = ProductType & { 
  quantity: number;
  reservation_id?: string; // ДОБАВЬ ЭТО
};
type BasketContextType = {
  basket: BasketProductType[];
  addToBasket: (product: ProductType) => void;
  removeProductToBasket: (id: string, size: string) => void;
  updateProductQuantity: (id: string, size: string, quantity: number) => void;
  updateProductSize: (id: string, oldSize: string, newSize: string) => void;
  clearBasket: () => void;
};

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
};

type BasketProviderProps = {
  children: ReactNode;
};

export const BasketProvider = ({ children }: BasketProviderProps) => {
  const [basket, setBasket] = useState<BasketProductType[]>([]);

  // Загружаем корзину из sessionStorage при монтировании компонента
  useEffect(() => {
    const getBasket = sessionStorage.getItem("basket");
    if (getBasket) {
      setBasket(JSON.parse(getBasket));
    }
  }, []);

  // Сохраняем корзину в sessionStorage при изменении корзины
  useEffect(() => {
    sessionStorage.setItem("basket", JSON.stringify(basket));
  }, [basket]);

  const addToBasket = (product: ProductType) => {
    setBasket((prevBasket) => {
      const existingItemIndex = prevBasket.findIndex(
        (item) => item.id === product.id && item.sizeSelect === product.sizeSelect
      );

      if (existingItemIndex > -1) {
        const updatedBasket = [...prevBasket];
        updatedBasket[existingItemIndex].quantity += 1;
        return updatedBasket;
      }

      return [...prevBasket, { ...product, quantity: 1 }];
    });
  };

  const removeProductToBasket = (id: string, size: string) => {
    setBasket((prevBasket) =>
      prevBasket.filter((item) => !(item.id === id && item.sizeSelect === size))
    );
  };

  const updateProductQuantity = (id: string, size: string, quantity: number) => {
    setBasket((prevBasket) =>
      prevBasket.map((item) =>
        item.id === id && item.sizeSelect === size
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const updateProductSize = (id: string, oldSize: string, newSize: string) => {
    setBasket((prevBasket) => {
      const itemIndex = prevBasket.findIndex(
        (item) => item.id === id && item.sizeSelect === oldSize
      );

      if (itemIndex > -1) {
        const updatedBasket = [...prevBasket];
        const existingItem = updatedBasket.find(
          (item) => item.id === id && item.sizeSelect === newSize
        );

        if (existingItem) {
          existingItem.quantity += updatedBasket[itemIndex].quantity;
          updatedBasket.splice(itemIndex, 1);
        } else {
          updatedBasket[itemIndex].sizeSelect = newSize;
        }

        return updatedBasket;
      }

      return prevBasket;
    });
  };

  const clearBasket = () => {
    setBasket([]);
    sessionStorage.removeItem("basket");
  };

  return (
    <BasketContext.Provider
      value={{ basket, addToBasket, removeProductToBasket, updateProductQuantity, updateProductSize, clearBasket }}
    >
      {children}
    </BasketContext.Provider>
  );
};