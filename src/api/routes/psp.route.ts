import { FastifyPluginAsync } from "fastify";
import {
  processPspSchema,
  get3dsSchema,
  paymentCompleteSchema,
  paymentCancelSchema,
} from "./schema/psp.schema";

const pspRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = fastify.pspController;

  fastify.post(
    "/psp/transactions",
    { schema: processPspSchema },
    controller.process,
  );

  fastify.get("/psp/3ds/:id", { schema: get3dsSchema }, controller.handle3ds);

  fastify.post(
    "/psp/payment-complete",
    { schema: paymentCompleteSchema },
    controller.paymentComplete,
  );

  fastify.post(
    "/psp/payment-cancel",
    {
      schema: paymentCancelSchema,
    },
    controller.paymentCancel,
  );
};

export default pspRoutes;
