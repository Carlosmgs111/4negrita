import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

export const OwnedTickets = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const userId = user?.id;
  if (!userId) {
    return null;
  }
  const { data: myTickets } = await supabase
    .from("ticket")
    .select("*")
    .eq("userId", userId);
  if (!myTickets) {
    return null;
  }
  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl text-heart-600 flex items-center">
            <Ticket className="mr-2" size={20} />
            Tus Boletos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto py-2 max-h-60 min-h-10 pt-4">
            {myTickets.length > 0 ? (
              myTickets.map(({ number, digits }: any) => (
                <Badge
                  key={number}
                  className="bg-green-500 text-white py-1 px-3 mb-1"
                >
                  <Ticket className="mr-1 h-3 w-3" />
                  {digits}
                </Badge>
              ))
            ) : (
              <div className="text-sm text-center flex flex-col items-center w-full gap-4 text-center flex items-center">
                <p>Aun no tienes ningun boleto.</p>
                <a
                  className="text-heart-600 py-2 px-6 border border-heart-600 rounded-[15px] w-full flex items-center justify-center"
                  href="/tickets"
                >
                  <Ticket size={20} className="mr-2" />
                  Adquiérelos Aquí
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
