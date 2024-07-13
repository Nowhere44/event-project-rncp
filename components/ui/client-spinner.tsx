'use client';

import { motion } from "framer-motion";

const ClientSpinner = () => (
    <div className="flex justify-center items-center h-screen">
        <motion.div
            className="w-16 h-16 border-t-4 border-orange-500 border-solid rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
    </div>
);

export default ClientSpinner;