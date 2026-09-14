export function getMockRequestFilePath(requestNo: string) {
  return `\\\\SMART-FFT\\SoftwareRequest\\Waiting Submit\\${requestNo}.xlsx`
}

export function getMockSubmittedFilePath(requestNo: string) {
  return `\\\\SMART-FFT\\SoftwareRequest\\Submit\\${requestNo}.xlsx`
}

export function getMockReviewFilePath(requestNo: string) {
  return `\\\\SMART-FFT\\SoftwareRequest\\Review\\${requestNo}.xlsx`
}

export function getMockProgrammerFilePath(requestNo: string, programmer: string) {
  const programmerFolder = programmer.trim().replace(/[^a-zA-Z0-9.-]+/g, '_')
  return `\\\\SMART-FFT\\SoftwareRequest\\Programmer\\${programmerFolder}\\${requestNo}.xlsx`
}

export function getMockDoneFilePath(requestNo: string) {
  return `\\\\SMART-FFT\\SoftwareRequest\\Done\\${requestNo}.xlsx`
}

export function getMockCancelledFilePath(requestNo: string) {
  return `\\\\SMART-FFT\\SoftwareRequest\\Cancelled\\${requestNo}.xlsx`
}
