import React, { useRef, useState } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import SignatureCanvas from 'react-signature-canvas';
import { submitSellerForm } from '../utils/api';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone is required'),
  address: Yup.string().required('Address is required'),
  items: Yup.array()
    .min(1, 'At least one item is required')
    .of(
      Yup.object().shape({
        itemName: Yup.string().required('Item name is required'),
        description: Yup.string(),
        condition: Yup.string().required('Condition is required'),
        estimatedValue: Yup.number().min(0, 'Value must be positive')
      })
    )
});

const SellerForm = () => {
  const signatureRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Debug log so you can see in the browser console that submit is called
      console.log('Submitting seller form with values:', values);

      setIsSubmitting(true);
      setSubmitError('');

      // Get signature data
      if (!signatureRef.current || signatureRef.current.isEmpty()) {
        setSubmitError('Please provide a signature');
        setIsSubmitting(false);
        return;
      }

      const signatureData = signatureRef.current.toDataURL();

      const formData = {
        ...values,
        signature: signatureData
      };

      await submitSellerForm(formData);
      setSubmitSuccess(true);
      resetForm();
      signatureRef.current.clear();
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Selling Form</h1>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Form submitted successfully! We will review your submission and get back to you soon.
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {submitError}
            </div>
          )}

          <Formik
            initialValues={{
              name: '',
              email: '',
              phone: '',
              address: '',
              items: [
                { itemName: '', description: '', condition: 'Good', estimatedValue: '' }
              ],
              sellerNotes: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched }) => (
              <Form>
                {/* Personal Information */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <Field
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <Field
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <Field
                        type="text"
                        id="address"
                        name="address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Items for Sale</h2>
                  
                  <FieldArray name="items">
                    {({ push, remove }) => (
                      <div>
                        {values.items.map((item, index) => (
                          <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium text-gray-700">Item {index + 1}</h3>
                              {values.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Item Name *
                                </label>
                                <Field
                                  type="text"
                                  name={`items.${index}.itemName`}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <ErrorMessage name={`items.${index}.itemName`} component="div" className="text-red-500 text-sm mt-1" />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Description
                                </label>
                                <Field
                                  as="textarea"
                                  name={`items.${index}.description`}
                                  rows="3"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Condition *
                                </label>
                                <Field
                                  as="select"
                                  name={`items.${index}.condition`}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="New">New</option>
                                  <option value="Like New">Like New</option>
                                  <option value="Good">Good</option>
                                  <option value="Fair">Fair</option>
                                  <option value="Poor">Poor</option>
                                </Field>
                                <ErrorMessage name={`items.${index}.condition`} component="div" className="text-red-500 text-sm mt-1" />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Estimated Value ($)
                                </label>
                                <Field
                                  type="number"
                                  name={`items.${index}.estimatedValue`}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <ErrorMessage name={`items.${index}.estimatedValue`} component="div" className="text-red-500 text-sm mt-1" />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => push({ itemName: '', description: '', condition: 'Good', estimatedValue: '' })}
                          className="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          + Add Another Item
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Notes */}
                <div className="mb-8">
                  <label htmlFor="sellerNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <Field
                    as="textarea"
                    id="sellerNotes"
                    name="sellerNotes"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Signature */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digital Signature *
                  </label>
                  <div className="border-2 border-gray-300 rounded-md p-2 bg-white overflow-auto">
                    <SignatureCanvas
                      ref={signatureRef}
                      canvasProps={{
                        className: 'signature-canvas',
                        width: 800,
                        height: 200
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear Signature
                  </button>
                  {errors.signature && touched.signature && (
                    <div className="text-red-500 text-sm mt-1">{errors.signature}</div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Form'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default SellerForm;
