<?php


namespace Ncg\BubbleMapBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Tfc\BaseBundle\Core;
use Tfc\BaseBundle\Table\Obj\symfony;
use Tfc\BaseBundle\Table\Obj\personal;

class BubbleMapController extends Controller {

  public function mapTestAction(){
    return $this->render( 'NcgBubbleMapBundle:BubbleMap:circles.html.twig', array() );
  }

  public function mapDbTestAction($map){

    return $this->render( 'NcgBubbleMapBundle:BubbleMap:circles.html.twig', array( "map_type" => $map ) );
  }

  public function mapJsonAction($map){
    $obj = symfony\TestBubbleMap::Get($map);
    if( $obj->getId() ){
      return new Response( $obj->getContent(), Response::HTTP_OK, array( 'content-type' => 'application/json' ) );
    }
    else{
      return new Response( NULL, Response::HTTP_NOT_FOUND );
    }
  }


  public function testFormAction(){
    if( $_POST && $_POST['saveVal'] ){
      file_put_contents( __DIR__.'/../Resources/js/test.json', $_POST['saveVal'] );
      header( "Location: /map_test" );
      exit;
    }
    return $this->render( 'NcgBubbleMapBundle:BubbleMap:form.html.twig', array() );
  }
}


