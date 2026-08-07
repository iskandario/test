import { useState } from 'react';

export type SizeChart = {
	[key: string]: string; // Динамически любые поля: ширина, длина, длина рукава, обхват груди и т.д.
  };
  
  export type ProductType = {
    id: string; // Уникальный идентификатор продукта
    title: string; // Название продукта
    compound: string; // Состав продукта
    price: number; // Цена продукта
    imgUrl: string; // URL изображения
    modelUrl: string; // URL 3D модели
    sizes: string[]; // Доступные размеры
    size_s_quantity: number; // Количество для размера S
    size_m_quantity: number; // Количество для размера M
    size_c_quantity: number; 
    size_l_quantity: number; // ДОБАВЬ ЭТО
    size_i_quantity: number;
    size_chart: Record<string, Record<string, string>>; // Размерная сетка
    sizeSelect?: string; // Выбранный размер (опционально)
  };

const useProducts = (): [ProductType[], React.Dispatch<React.SetStateAction<ProductType[]>>] => {


	const [products, setProducts] = useState<ProductType[]>([]);

	return [products, setProducts]; // Возвращаем initialProducts
};

export default useProducts;
