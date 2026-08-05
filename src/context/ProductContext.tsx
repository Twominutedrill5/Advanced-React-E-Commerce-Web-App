import { createContext, useReducer, ReactNode } from "react";

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

type ProductAction =
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "SET_SELECTED_CATEGORY"; payload: string };

interface ProductState {
  products: Product[];
  selectedCategory: string;
}

interface ProductContextProps {
  products: Product[];
  selectedCategory: string;
  dispatch: React.Dispatch<ProductAction>;
}

const initialState: ProductState = {
  products: [],
  selectedCategory: "",
};

const productReducer = (
  state: ProductState,
  action: ProductAction,
): ProductState => {
  switch (action.type) {
    case "SET_PRODUCTS":
      return { ...state, products: action.payload };
    case "SET_SELECTED_CATEGORY":
      return { ...state, selectedCategory: action.payload };
    default:
      return state;
  }
};

const ProductContext = createContext<ProductContextProps | undefined>(
  undefined,
);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  return (
    <ProductContext.Provider
      value={{
        products: state.products,
        selectedCategory: state.selectedCategory,
        dispatch,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
