import BidonesChart from "./Charts/BidonesChart";
import style from "./BodyHome.module.css";
export default function BodyHome() {
  return (
    <div className={style.chartsContainer}>
      <BidonesChart />
      <BidonesChart />
      <BidonesChart />
    </div>
  );
}
