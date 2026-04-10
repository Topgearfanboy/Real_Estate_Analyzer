import type { RentBlockData } from "../../types";

export function handleVacancyTypeChange(
  data: RentBlockData,
  onChange: (data: RentBlockData) => void,
  newType: "$" | "%",
) {
  const rentNum = parseFloat(data.monthlyRent.replace(/[^0-9.]/g, "")) || 0;
  const vacancyNum = parseFloat(data.vacancy) || 0;

  let convertedVacancy: string;

  if (data.vacancyType === "%" && newType === "$") {
    // Converting from % to $: vacancy % of monthly rent
    convertedVacancy =
      rentNum > 0
        ? Math.round((vacancyNum / 100) * rentNum).toString()
        : data.vacancy;
  } else if (data.vacancyType === "$" && newType === "%") {
    // Converting from $ to %: (vacancy / rent) * 100
    convertedVacancy =
      rentNum > 0
        ? ((vacancyNum / rentNum) * 100).toFixed(2)
        : data.vacancy;
  } else {
    convertedVacancy = data.vacancy;
  }

  onChange({
    ...data,
    vacancyType: newType,
    vacancy: convertedVacancy,
  });
}

export function handleManagementTypeChange(
  data: RentBlockData,
  onChange: (data: RentBlockData) => void,
  newType: "$" | "%",
) {
  const rentNum = parseFloat(data.monthlyRent.replace(/[^0-9.]/g, "")) || 0;
  const managementNum = parseFloat(data.management) || 0;

  let convertedManagement: string;

  if (data.managementType === "%" && newType === "$") {
    convertedManagement =
      rentNum > 0
        ? Math.round((managementNum / 100) * rentNum).toString()
        : data.management;
  } else if (data.managementType === "$" && newType === "%") {
    convertedManagement =
      rentNum > 0
        ? ((managementNum / rentNum) * 100).toFixed(2)
        : data.management;
  } else {
    convertedManagement = data.management;
  }

  onChange({
    ...data,
    managementType: newType,
    management: convertedManagement,
  });
}

export function handleMaintenanceTypeChange(
  data: RentBlockData,
  onChange: (data: RentBlockData) => void,
  newType: "$" | "%",
) {
  const rentNum = parseFloat(data.monthlyRent.replace(/[^0-9.]/g, "")) || 0;
  const maintenanceNum = parseFloat(data.maintenance) || 0;

  let convertedMaintenance: string;

  if (data.maintenanceType === "%" && newType === "$") {
    convertedMaintenance =
      rentNum > 0
        ? Math.round((maintenanceNum / 100) * rentNum).toString()
        : data.maintenance;
  } else if (data.maintenanceType === "$" && newType === "%") {
    convertedMaintenance =
      rentNum > 0
        ? ((maintenanceNum / rentNum) * 100).toFixed(2)
        : data.maintenance;
  } else {
    convertedMaintenance = data.maintenance;
  }

  onChange({
    ...data,
    maintenanceType: newType,
    maintenance: convertedMaintenance,
  });
}
