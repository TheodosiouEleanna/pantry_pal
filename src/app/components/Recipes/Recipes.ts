import { wrapper } from "../../../redux/store";
import { useSelector } from "react-redux/es/exports";
import { useDispatch } from "react-redux";
import { RootState } from "@/redux/rootReducer";
import { increment } from "@/redux/features/counterSlice";

const Recipes = () => {
  const dispatch = useDispatch();
  const counter = useSelector((state: RootState) => state.counter.value);
};

export default wrapper.withRedux(Recipes);
