import { motion } from "framer-motion";

const ColorPalette = () => {
  const colors = [
    { name: "Navy", color: "bg-navy", text: "text-text-primary" },
    { name: "Navy Light", color: "bg-navy-light", text: "text-text-primary" },
    { name: "Purple", color: "bg-purple", text: "text-text-primary" },
    {
      name: "Purple Light",
      color: "bg-purple-light",
      text: "text-text-primary",
    },
    {
      name: "Purple Hover",
      color: "bg-purple-hover",
      text: "text-text-primary",
    },
    { name: "Blue Accent", color: "bg-accent-blue", text: "text-text-primary" },
    { name: "Cyan Accent", color: "bg-accent-cyan", text: "text-text-primary" },
    {
      name: "Yellow Accent",
      color: "bg-accent-yellow",
      text: "text-text-primary",
    },
    {
      name: "Magenta Accent",
      color: "bg-accent-magenta",
      text: "text-text-primary",
    },
    {
      name: "Lavender Accent",
      color: "bg-accent-lavender",
      text: "text-text-primary",
    },
    { name: "Error", color: "bg-status-error", text: "text-text-primary" },
    { name: "Success", color: "bg-status-success", text: "text-text-primary" },
  ];

  return (
    <div className="bg-navy min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          Color Palette
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {colors.map((item) => (
            <motion.div
              key={item.name}
              whileHover={{ y: -5 }}
              className={`${item.color} p-6 rounded-lg shadow-lg`}
            >
              <h3 className={`${item.text} text-xl font-semibold`}>
                {item.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;
