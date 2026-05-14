import axios from 'axios'

const SQUAD_API_URL = process.env.SQUAD_API_URL || 'https://sandbox-api-d.squadco.com'
const SQUAD_SECRET_KEY = process.env.SQUAD_SECRET_KEY

interface CreateVirtualAccountParams {
  customer_identifier: string
  mobile_num: string
  first_name: string
  last_name: string
}

interface TransferParams {
  account_number: string
  bank_code: string
  amount: number
  currency_id: 'NGN'
  remark: string
}

export class SquadAPI {
  private apiUrl: string
  private secretKey: string

  constructor() {
    if (!SQUAD_SECRET_KEY) {
      throw new Error('SQUAD_SECRET_KEY is not configured')
    }
    this.apiUrl = SQUAD_API_URL
    this.secretKey = SQUAD_SECRET_KEY
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Create a virtual account (NUBAN) for a user
   */
  async createVirtualAccount(params: CreateVirtualAccountParams) {
    try {
      // Format mobile number: Squad requires 11 or 13 digits
      // Convert +2348087986853 to 08087986853 (11 digits)
      let formattedMobile = params.mobile_num.replace(/\D/g, '') // Remove non-digits
      if (formattedMobile.startsWith('234')) {
        formattedMobile = '0' + formattedMobile.slice(3) // Convert 234... to 0...
      }
      
      const response = await axios.post(
        `${this.apiUrl}/virtual-account`,
        {
          customer_identifier: params.customer_identifier,
          mobile_num: formattedMobile, // Formatted to 11 digits
          first_name: params.first_name,
          last_name: params.last_name,
          email: `${params.customer_identifier.replace(/\D/g, '')}@recyclepay.ng`, // Generate email from phone
          bvn: '22343211654', // Fake BVN for demo (from Squad docs)
          dob: '07/19/1990', // Fake DOB for demo (MM/DD/YYYY format)
          address: '22 Kota street, Lagos, Nigeria', // Fake address for demo
          gender: '1', // 1 = Male, 2 = Female (hardcoded for demo)
          beneficiary_account: '4920299492', // Fake beneficiary account for demo (from Squad docs)
        },
        { headers: this.getHeaders() }
      )
      return response.data
    } catch (error) {
      console.error('Squad API Error (Create Virtual Account):', error)
      throw error
    }
  }

  /**
   * Transfer money to a user's account
   */
  async transfer(params: TransferParams) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/payout/transfer`,
        {
          account_number: params.account_number,
          bank_code: params.bank_code,
          amount: params.amount * 100, // Convert to kobo
          currency_id: params.currency_id,
          remark: params.remark,
        },
        { headers: this.getHeaders() }
      )
      return response.data
    } catch (error) {
      console.error('Squad API Error (Transfer):', error)
      throw error
    }
  }

  /**
   * Get virtual account details
   */
  async getVirtualAccountDetails(accountNumber: string) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/virtual-account/${accountNumber}`,
        { headers: this.getHeaders() }
      )
      return response.data
    } catch (error) {
      console.error('Squad API Error (Get Account):', error)
      throw error
    }
  }
}

export const squadAPI = new SquadAPI()
