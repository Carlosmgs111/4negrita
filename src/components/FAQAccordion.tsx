import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQAccordion = ({faqs}: {faqs: any}) => {
  return (
    <Accordion  type="single" collapsible className="w-full">
      {faqs.map((faq: any, index: any) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border-b border-gray-200"
        >
          <AccordionTrigger className="text-left font-medium py-4">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 pb-4">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
