"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useCalculatorStore, stepToPathMap } from "@/store/calculator-store" // --- CORRECCIÓN: Importar stepToPathMap ---
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import "react-phone-number-input/style.css"
import "./phone-input-custom.css"
import { shallow } from "zustand/shallow"

const CURRENT_PAGE_STEP = 2

export default function DatosUsuarioPage() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    formData: { full_name, email, phone_number, country_code }, // Added country_code
    updateFormData,
    nextStep,
    goToStep,
    currentStep,
    initializeStepFromPath,
  } = useCalculatorStore(
    (state) => ({
      formData: {
        full_name: state.full_name,
        email: state.email,
        phone_number: state.phone_number,
        country_code: state.country_code, // Added country_code
      },
      updateFormData: state.updateFormData,
      nextStep: state.nextStep,
      goToStep: state.goToStep,
      currentStep: state.currentStep,
      initializeStepFromPath: state.initializeStepFromPath,
    }),
    shallow, // Add shallow equality checker
  )

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    initializeStepFromPath(pathname)
  }, [pathname, initializeStepFromPath])

  useEffect(() => {
    const expectedPathForStoreStep = stepToPathMap[currentStep]
    if (expectedPathForStoreStep && pathname !== expectedPathForStoreStep) {
      console.log(
        `[DatosUsuarioPage] Store step (${currentStep}) changed. Redirecting from ${pathname} to ${expectedPathForStoreStep}.`,
      )
      router.push(expectedPathForStoreStep)
    }
  }, [currentStep, pathname, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name === "full_name" ? "fullName" : e.target.name]: "" }))
  }

  const handlePhoneChange = (value?: string) => {
    updateFormData({ phone_number: value || "" })
    if (value && isValidPhoneNumber(value)) {
      setErrors((prev) => ({ ...prev, phone: "" }))
    }
  }

  const validate = () => {
    const newErrors = { fullName: "", email: "", phone: "" }
    let isValid = true
    if (!full_name?.trim()) {
      newErrors.fullName = "El nombre completo es obligatorio."
      isValid = false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Por favor, introduce un correo electrónico válido."
      isValid = false
    }
    if (phone_number && !isValidPhoneNumber(phone_number)) {
      newErrors.phone = "Por favor, introduce un número de teléfono válido."
      isValid = false
    }
    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validate()) {
      nextStep(router)
    }
  }

  const handlePrev = () => {
    goToStep(1, router)
  }

  // --- CORRECCIÓN: Simplificar la lógica de renderizado ---
  if (pathname !== stepToPathMap[CURRENT_PAGE_STEP]) {
    return <div className="text-center p-6">Cargando...</div>
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-brand-gray-dark rounded-lg shadow-xl animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-brand-white">Completa tus datos</h2>
        <p className="text-gray-400 mt-2">Es el siguiente paso para conocer tu rentabilidad.</p>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name" className="text-sm font-medium text-gray-300">
            Nombre completo
          </Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Tu nombre y apellidos"
            value={full_name || ""}
            onChange={handleInputChange}
            className={`bg-gray-800 border-gray-700 text-brand-white focus:ring-brand-accent ${errors.fullName ? "border-red-500" : ""}`}
            required
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-300">
            Correo electrónico
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={email || ""}
            onChange={handleInputChange}
            className={`bg-gray-800 border-gray-700 text-brand-white focus:ring-brand-accent ${errors.email ? "border-red-500" : ""}`}
            required
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="phone_number" className="text-sm font-medium text-gray-300">
            Número de teléfono
          </Label>
          <PhoneInput
            id="phone_number"
            name="phone_number"
            placeholder="Tu número de teléfono"
            value={phone_number || ""}
            onChange={handlePhoneChange}
            defaultCountry="ES"
            international
            countryCallingCodeEditable={false}
            className={`phone-input-container ${errors.phone ? "phone-input-error" : ""}`}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>
      <div className="flex justify-between pt-4">
        <Button
          onClick={handlePrev}
          variant="outline"
          className="border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-black"
        >
          Anterior
        </Button>
        <Button onClick={handleNext} className="bg-brand-accent text-brand-black hover:bg-opacity-80">
          Siguiente
        </Button>
      </div>
    </div>
  )
}
