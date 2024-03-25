import * as Icon from "rocket-bolt/fa";
import Image from "next/image";

// const [A] = Object.values(Icon);
// console.log(A);

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-wrap">
        {Object.values(Icon).map((Icon, i) => (
          <Icon key={i} className="fill-sky-800" />
        ))}
      </div>
    </main>
  );
}
